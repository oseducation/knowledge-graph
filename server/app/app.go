package app

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/oseducation/knowledge-graph/config"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/oseducation/knowledge-graph/store"
	"github.com/pkg/errors"
)

const YOUTUBE_API_KEY = "YOUTUBE_API_KEY"

// App type defines application global state
type App struct {
	Log         *log.Logger
	Store       store.Store
	Config      *config.Config
	Graph       *model.Graph
	Environment map[string]string
}

// NewApp creates new App
func NewApp(logger *log.Logger, store store.Store, config *config.Config) (*App, error) {
	if config.ServerSettings.KnowledgeGraphImportURL != "" {
		if err := importKnowledgeGraphToDB(config.ServerSettings.KnowledgeGraphImportURL, store, logger); err != nil {
			return nil, errors.Wrap(err, "can't import knowledge graph")
		}
	}
	graph, err := store.Graph().ConstructGraphFromDB()
	if err != nil {
		return nil, errors.Wrap(err, "can't construct graph from DB")
	}

	environment := make(map[string]string)
	youtubeAPIKey, ok := os.LookupEnv(YOUTUBE_API_KEY)
	if ok {
		environment[YOUTUBE_API_KEY] = youtubeAPIKey
	}

	return &App{logger, store, config, graph, environment}, nil
}

// GetSiteURL returns site url from config
func (a *App) GetSiteURL() string {
	return "http://localhost:9081"
}

// ImportGraph reads graph.json, nodes.json and texts.md files, parses them and imports in the db
func (a *App) ImportGraph(url string) error {
	authorContent, err := getFileContent(fmt.Sprintf("%s/author.json", url))
	if err != nil {
		return errors.Wrap(err, "can't get author.json file")
	}
	var user model.User
	if err := json.Unmarshal([]byte(authorContent), &user); err != nil {
		return errors.Wrapf(err, "can't unmarshal author.json file\n%s", authorContent)
	}

	updatedUser, err := a.Store.User().Save(&user)
	if err != nil {
		return errors.Wrap(err, "can't save user")
	}

	graphContent, err := getFileContent(fmt.Sprintf("%s/graph.json", url))
	if err != nil {
		return errors.Wrapf(err, "can't get graph.json file\n", graphContent)
	}
	var graph map[string][]string
	if err2 := json.Unmarshal([]byte(graphContent), &graph); err2 != nil {
		return errors.Wrap(err2, "can't unmarshal graph.json file")
	}

	nodesContent, err := getFileContent(fmt.Sprintf("%s/nodes.json", url))
	if err != nil {
		return errors.Wrapf(err, "can't get nodes.json file\n", nodesContent)
	}

	type NodeWithKey struct {
		model.Node
		Key string `json:"key"`
	}

	var nodes map[string]NodeWithKey
	if err2 := json.Unmarshal([]byte(nodesContent), &nodes); err2 != nil {
		return errors.Wrap(err, "can't unmarshal nodes.json file")
	}

	examplesContent, err := getFileContent(fmt.Sprintf("%s/examples.json", url))
	if err != nil {
		return errors.Wrap(err, "can't get examples.json file")
	}
	var exampleNodes map[string]model.Node
	if err := json.Unmarshal([]byte(examplesContent), &exampleNodes); err != nil {
		return errors.Wrap(err, "can't unmarshal examples.json file")
	}

	for id, node := range nodes {
		node.NodeType = model.NodeTypeLecture
		updatedNode, err := a.Store.Node().Save(&node.Node)
		if err != nil {
			return errors.Wrap(err, "can't save node")
		}
		nodes[id] = NodeWithKey{
			Node: *updatedNode,
		}

		if node.Key == "" {
			continue
		}
		title, duration, err := a.GetYoutubeVideoInfo(node.Key)
		if err != nil {
			return errors.Wrapf(err, "can't get youtube video info %s", node.Key)
		}
		video := model.Video{
			Name:           title,
			VideoType:      model.YouTubeVideoType,
			Key:            node.Key,
			NodeID:         updatedNode.ID,
			Length:         duration,
			AuthorID:       updatedUser.ID,
			AuthorUsername: updatedUser.Username,
		}
		if _, err := a.Store.Video().Save(&video); err != nil {
			return errors.Wrap(err, "can't save video")
		}
	}

	for id, node := range exampleNodes {
		node.NodeType = model.NodeTypeExample
		updatedNode, err := a.Store.Node().Save(&node)
		if err != nil {
			return errors.Wrap(err, "can't save node")
		}
		nodes[id] = NodeWithKey{
			Node: *updatedNode,
		}
	}

	for node, prereqs := range graph {
		for _, prereq := range prereqs {
			edge := model.Edge{
				FromNodeID: nodes[prereq].ID,
				ToNodeID:   nodes[node].ID,
			}
			if err := a.Store.Graph().Save(&edge); err != nil {
				return errors.Wrap(err, "can't save edge")
			}
		}
	}
	return nil
}

func importKnowledgeGraphToDB(url string, db store.Store, logger *log.Logger) error {
	content, err := getFileContent(url)
	if err != nil {
		return err
	}

	nodes, prerequisites := parseMDContent(content, logger)

	for i, node := range nodes {
		updatedNode, err := db.Node().Save(&node)
		if err != nil {
			return errors.Wrap(err, "can't save node")
		}
		nodes[i] = *updatedNode
	}

	for i, nodePrereqs := range prerequisites {
		for _, prereq := range nodePrereqs {
			edge := model.Edge{
				FromNodeID: nodes[prereq-1].ID,
				ToNodeID:   nodes[i].ID,
			}
			if err := db.Graph().Save(&edge); err != nil {
				return errors.Wrap(err, "can't save edge")
			}
		}
	}

	return nil
}

func getFileContent(url string) (string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}

func parseMDContent(content string, logger *log.Logger) ([]model.Node, [][]int) {
	nodes := []model.Node{}
	prerequisites := [][]int{}
	nodeLines := strings.Split(content, "\n## ")
	for _, nodeLine := range nodeLines[1:] {
		lines := strings.Split(nodeLine, "\n")
		id, name := getIDAndName(lines[0])
		if id == -1 {
			logger.Error("wrong first line in the node", log.String("id. name", lines[0]))
			continue
		}
		if len(nodes)+1 != id {
			logger.Error("wrong next id", log.Int("node len", len(nodes)), log.Int("id", id))
			continue
		}

		description := ""
		nodePrereqs := []int{}
		brokenNode := false
		for i := 1; i < len(lines); i++ {
			if strings.HasPrefix(lines[i], "### Name") {
				i++
				if i >= len(lines) || lines[i] != name {
					logger.Error("wrong name in node", log.String("nodeLine", nodeLine))
					brokenNode = true
					break
				}
			} else if strings.HasPrefix(lines[i], "### Description") {
				i++
				if i >= len(lines) {
					logger.Error("No description", log.String("nodeLine", nodeLine))
					brokenNode = true
					break
				}
				description = lines[i]
			} else if strings.HasPrefix(lines[i], "### Prerequisites") {
				for j := i + 1; j < len(lines); j++ {
					if lines[j] == "None" || lines[j] == "" {
						break
					}
					id, prereqName := getIDAndName(lines[j])
					if len(nodes) < id {
						logger.Error("wrong id in prereqs", log.String("prereq", lines[j]))
						brokenNode = true
						break
					}
					if nodes[id-1].Name != prereqName {
						logger.Error("id and name mismatch in prereq", log.String("prereq", lines[j]))
						brokenNode = true
						break
					}
					nodePrereqs = append(nodePrereqs, id)
				}
				i = len(lines)
			}
		}

		if brokenNode {
			continue
		}
		nodes = append(nodes, model.Node{
			Name:        name,
			Description: description,
		})
		prerequisites = append(prerequisites, nodePrereqs)
	}
	return nodes, prerequisites
}

func getIDAndName(idAndName string) (int, string) {
	s := strings.Split(idAndName, ". ")
	if len(s) != 2 {
		return -1, ""
	}
	id, err := strconv.Atoi(s[0])
	if err != nil {
		return -1, ""
	}
	name := strings.Trim(s[1], " ")
	return id, name
}

// PerformDBCheck checks if database is connectable
func (a *App) PerformDBCheck() error {
	if _, err := a.Store.System().GetCurrentVersion(); err != nil {
		return err
	}
	return nil
}
