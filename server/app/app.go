package app

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/oseducation/knowledge-graph/config"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/oseducation/knowledge-graph/store"
	"github.com/pkg/errors"
)

const YoutubeAPIKey = "YOUTUBE_API_KEY"

// App type defines application global state
type App struct {
	Log         *log.Logger
	Store       store.Store
	Config      *config.Config
	Graph       *model.Graph
	Environment map[string]string
	Random      *rand.Rand
}

// NewApp creates new App
func NewApp(logger *log.Logger, store store.Store, config *config.Config) (*App, error) {
	if config.ServerSettings.KnowledgeGraphImportURL != "" {
		if err := importKnowledgeGraphToDB(config.ServerSettings.KnowledgeGraphImportURL, store, logger); err != nil {
			return nil, errors.Wrap(err, "can't import knowledge graph")
		}
		logger.Info("graph imported to DB")
	}
	graph, err := store.Graph().ConstructGraphFromDB()
	if err != nil {
		return nil, errors.Wrap(err, "can't construct graph from DB")
	}
	logger.Info("graph constructed", log.String("nodes", strconv.Itoa(len(graph.Nodes))), log.String("prerequisites", strconv.Itoa(len(graph.Prerequisites))))

	environment := make(map[string]string)
	youtubeAPIKey, ok := os.LookupEnv(YoutubeAPIKey)
	if !ok {
		return nil, errors.New("youtube api key is not set")
	}
	environment[YoutubeAPIKey] = youtubeAPIKey

	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	return &App{logger, store, config, graph, environment, r}, nil
}

// GetSiteURL returns site url from config
func (a *App) GetSiteURL() string {
	return a.Config.ServerSettings.SiteURL
}

type NodeWithKey struct {
	model.Node
	Key string `json:"key"`
}

// ImportGraph reads graph.json, nodes.json and texts.md files, parses them and imports in the db
func (a *App) ImportGraph(url string) (string, error) {
	authorContent, err := getFileContent(fmt.Sprintf("%s/author.json", url))
	if err != nil {
		return "", errors.Wrap(err, "can't get author.json file")
	}
	var user model.User
	if err2 := json.Unmarshal([]byte(authorContent), &user); err2 != nil {
		return "", errors.Wrapf(err2, "can't unmarshal author.json file\n%s", authorContent)
	}

	password := model.NewRandomString(20)
	user.Password = password

	updatedUser, err := a.Store.User().Save(&user)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			var err2 error
			updatedUser, err2 = a.Store.User().GetByEmail(user.Email)
			if err2 != nil {
				return "", errors.Wrap(err, "can't get same user from db")
			}
			password = "same as before"
		} else {
			return "", errors.Wrap(err, "can't save user")
		}
	}
	if err != nil && !strings.Contains(err.Error(), "UNIQUE constraint") {
		return "", errors.Wrap(err, "can't save user")
	}

	graphContent, err := getFileContent(fmt.Sprintf("%s/graph.json", url))
	if err != nil {
		return "", errors.Wrapf(err, "can't get graph.json file\n%s", graphContent)
	}
	var graph map[string][]string
	if err2 := json.Unmarshal([]byte(graphContent), &graph); err2 != nil {
		return "", errors.Wrap(err2, "can't unmarshal graph.json file")
	}

	nodesContent, err := getFileContent(fmt.Sprintf("%s/nodes.json", url))
	if err != nil {
		return "", errors.Wrapf(err, "can't get nodes.json file\n%s", nodesContent)
	}

	var nodes map[string]NodeWithKey
	if err2 := json.Unmarshal([]byte(nodesContent), &nodes); err2 != nil {
		return "", errors.Wrap(err, "can't unmarshal nodes.json file")
	}

	for id, node := range nodes {
		node.NodeType = model.NodeTypeLecture
		node.Lang = updatedUser.Lang
		updatedNode, err := a.importNode(&node.Node)
		if err != nil {
			return "", errors.Wrap(err, "can't import node")
		}

		nodes[id] = NodeWithKey{
			Node: *updatedNode,
		}
		if node.Key == "" {
			continue
		}

		title, duration, err := a.GetYoutubeVideoInfo(node.Key)
		if err != nil {
			return "", errors.Wrapf(err, "can't get youtube video info %s", node.Key)
		}

		video := model.Video{
			Name:      title,
			VideoType: model.YouTubeVideoType,
			Key:       node.Key,
			NodeID:    updatedNode.ID,
			Length:    duration,
			AuthorID:  updatedUser.ID,
		}

		if _, err := a.Store.Video().Save(&video); err != nil && !strings.Contains(err.Error(), "UNIQUE constraint") {
			return "", errors.Wrap(err, "can't save video")
		}
	}

	if err := a.importExamples(nodes, url, updatedUser.Lang, updatedUser.ID); err != nil {
		return "", errors.Wrap(err, "can't import examples")
	}

	for node, prereqs := range graph {
		for _, prereq := range prereqs {
			edge := model.Edge{
				FromNodeID: nodes[prereq].ID,
				ToNodeID:   nodes[node].ID,
			}
			if err := a.Store.Graph().Save(&edge); err != nil && !strings.Contains(err.Error(), "UNIQUE constraint") {
				return "", errors.Wrap(err, "can't save edge")
			}
		}
	}

	if err := a.importNodeTexts(nodes, updatedUser.ID, url); err != nil {
		return "", errors.Wrap(err, "can't import texts for nodes")
	}

	return password, nil
}

func (a *App) importExamples(nodes map[string]NodeWithKey, url, lang, userID string) error {
	examplesContent, err := getFileContent(fmt.Sprintf("%s/examples.json", url))
	if err != nil {
		return errors.Wrap(err, "can't get examples.json file")
	}

	type ExampleNode struct {
		Name         string
		ProblemMD    string
		SolutionMD   string
		SolutionCode string
	}

	var exampleNodes map[string]ExampleNode
	if err := json.Unmarshal([]byte(examplesContent), &exampleNodes); err != nil {
		return errors.Wrap(err, "can't unmarshal examples.json file")
	}

	for id, eNode := range exampleNodes {
		description := "Try to solve the problem before viewing the solution"
		if lang == model.LanguageGeorgian {
			description = "შეეცადე თავად ამოხსნა ამოცანა, სანამ ამოხსნას ნახავ"
		}
		node := model.Node{
			Name:        eNode.Name,
			Description: description,
			NodeType:    model.NodeTypeExample,
			Lang:        lang,
		}

		updatedNode, err := a.importNode(&node)
		if err != nil {
			return errors.Wrap(err, "can't import example node")
		}

		if err := a.saveProblemText(url, eNode.Name, lang, eNode.ProblemMD, updatedNode.ID, userID); err != nil {
			return errors.Wrap(err, "can't save problem text")
		}

		if err := a.saveSolutionText(url, eNode.Name, lang, eNode.SolutionMD, updatedNode.ID, userID); err != nil {
			return errors.Wrap(err, "can't save solution text")
		}

		if err := a.saveSolutionCode(url, eNode.Name, lang, eNode.SolutionCode, updatedNode.ID, userID); err != nil {
			return errors.Wrap(err, "can't save solution text")
		}

		nodes[id] = NodeWithKey{
			Node: *updatedNode,
		}
	}
	return nil
}

func (a *App) saveProblemText(url, name, lang, problemMD, nodeID, userID string) error {
	mdContent := problemMD
	if mdContent == "" {
		filename := fmt.Sprintf("%s/problems/%s.md", url, name)
		var err error
		mdContent, err = getFileContent(filename)
		if err != nil {
			return errors.Wrapf(err, "can't get file content %s", filename)
		}
		if strings.Contains(mdContent, "404: Not Found") {
			return nil
		}
	}
	pName := fmt.Sprintf("Problem: %s", name)
	if lang == model.LanguageGeorgian {
		pName = fmt.Sprintf("ამოცანა: %s", name)
	}
	if _, err := a.Store.Text().Save(&model.Text{
		Name:     pName,
		Text:     mdContent,
		NodeID:   nodeID,
		AuthorID: userID,
	}); err != nil && !strings.Contains(err.Error(), "UNIQUE constraint") {
		return errors.Wrap(err, "can't save problem text")
	}
	return nil
}

func (a *App) saveSolutionText(url, name, lang, solutionMD, nodeID, userID string) error {
	mdContent := solutionMD
	if mdContent == "" {
		filename := fmt.Sprintf("%s/solutions/%s.md", url, name)
		var err error
		mdContent, err = getFileContent(filename)
		if err != nil {
			return errors.Wrapf(err, "can't get file content %s", filename)
		}
		if strings.Contains(mdContent, "404: Not Found") {
			return nil
		}
	}
	sName := fmt.Sprintf("Solution: %s", name)
	if lang == model.LanguageGeorgian {
		sName = fmt.Sprintf("ამოხსნა: %s", name)
	}
	if _, err := a.Store.Text().Save(&model.Text{
		Name:     sName,
		Text:     mdContent,
		NodeID:   nodeID,
		AuthorID: userID,
	}); err != nil && !strings.Contains(err.Error(), "UNIQUE constraint") {
		return errors.Wrap(err, "can't save solution text")
	}
	return nil
}

func (a *App) saveSolutionCode(url, name, lang, solutionCode, nodeID, userID string) error {
	codeContent := solutionCode
	if codeContent == "" {
		filename := fmt.Sprintf("%s/codes/%s.java", url, name)
		var err error
		codeContent, err = getFileContent(filename)
		if err != nil {
			return errors.Wrapf(err, "can't get file content %s", filename)
		}
		if strings.Contains(codeContent, "404: Not Found") {
			return nil
		}
	}
	sName := fmt.Sprintf("Code: %s", name)
	if lang == model.LanguageGeorgian {
		sName = fmt.Sprintf("კოდი: %s", name)
	}
	if _, err := a.Store.Text().Save(&model.Text{
		Name:     sName,
		Text:     fmt.Sprintf("```java\n%s```", codeContent),
		NodeID:   nodeID,
		AuthorID: userID,
	}); err != nil && !strings.Contains(err.Error(), "UNIQUE constraint") {
		return errors.Wrap(err, "can't save solution text")
	}
	return nil
}

func (a *App) importNode(node *model.Node) (*model.Node, error) {
	var updatedNode *model.Node
	oldNode, err := a.Store.Node().GetByName(node.Name)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, errors.Wrapf(err, "can't get node by name - %s", node.Name)
	}
	if err == nil {
		if oldNode.Name == node.Name &&
			oldNode.Description == node.Description &&
			oldNode.NodeType == node.NodeType &&
			oldNode.Lang == node.Lang {
			// nothing needs to be changed
			return oldNode, nil
		}
		// node needs to be updated
		updatedNode = node.Clone()
		updatedNode.ID = oldNode.ID
		updatedNode.CreatedAt = oldNode.CreatedAt
		if err2 := a.Store.Node().Update(updatedNode); err2 != nil {
			return nil, errors.Wrapf(err2, "can't update node with id `%s` and name `%s`", updatedNode.ID, updatedNode.Name)
		}
		a.Log.Info("updated node", log.String("oldNode", fmt.Sprintf("%v", oldNode)), log.String("newNode", fmt.Sprintf("%v", updatedNode)))
		return updatedNode, nil
	}

	// no old node in db, we can just save
	updatedNode, err = a.Store.Node().Save(node)
	if err != nil {
		return nil, errors.Wrapf(err, "can't save node - %v", node)
	}

	return updatedNode, nil
}

func (a *App) importNodeTexts(nodes map[string]NodeWithKey, userID, url string) error {
	for id, node := range nodes {
		filename := fmt.Sprintf("%s/texts/%s.md", url, id)
		mdContent, err := getFileContent(filename)
		if err != nil {
			return errors.Wrapf(err, "can't get %s file\n%s", filename, mdContent)
		}
		if strings.Contains(mdContent, "404: Not Found") {
			continue
		}
		name := strings.Split(mdContent, "\n")[0][2:]
		if _, err := a.Store.Text().Save(&model.Text{
			Name:     name,
			Text:     mdContent,
			NodeID:   node.ID,
			AuthorID: userID,
		}); err != nil && !strings.Contains(err.Error(), "UNIQUE constraint") {
			return errors.Wrap(err, "can't save text")
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
