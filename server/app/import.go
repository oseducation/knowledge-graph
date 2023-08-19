package app

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

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
		if strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
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
	if err != nil && !strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
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

		if _, err := a.Store.Video().Save(&video); err != nil && !strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
			return "", errors.Wrap(err, "can't save video")
		}
	}

	if err := a.importExamples(nodes, url, updatedUser.Lang, updatedUser.ID); err != nil {
		return "", errors.Wrap(err, "can't import examples")
	}

	if err := a.importAssignments(nodes, url, updatedUser.Lang, updatedUser.ID); err != nil {
		return "", errors.Wrap(err, "can't import assignments")
	}

	for node, prereqs := range graph {
		for _, prereq := range prereqs {
			edge := model.Edge{
				FromNodeID: nodes[prereq].ID,
				ToNodeID:   nodes[node].ID,
			}
			if err := a.Store.Graph().Save(&edge); err != nil && !strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
				return "", errors.Wrap(err, "can't save edge")
			}
		}
	}

	if err := a.importNodeTexts(nodes, updatedUser.ID, url); err != nil {
		return "", errors.Wrap(err, "can't import texts for nodes")
	}

	if err := a.importNodeQuestions(nodes, url); err != nil {
		return "", errors.Wrap(err, "can't import questions for nodes")
	}

	return password, nil
}

func (a *App) importAssignments(nodes map[string]NodeWithKey, url, lang, userID string) error {
	assignmentsContent, err := getFileContent(fmt.Sprintf("%s/assignments.json", url))
	if err != nil {
		return errors.Wrap(err, "can't get assignments.json file")
	}

	type AssignmentNode struct {
		Name        string
		Description string
		TextMD      string
	}

	var assignmentNodes map[string]AssignmentNode
	if err := json.Unmarshal([]byte(assignmentsContent), &assignmentNodes); err != nil {
		return errors.Wrap(err, "can't unmarshal assignments.json file")
	}

	for id, aNode := range assignmentNodes {
		node := model.Node{
			Name:        aNode.Name,
			Description: aNode.Description,
			NodeType:    model.NodeTypeAssignment,
			Lang:        lang,
		}

		updatedNode, err := a.importNode(&node)
		if err != nil {
			return errors.Wrap(err, "can't import assignment node")
		}

		if err := a.saveAssignmentText(url, id, aNode.Name, lang, updatedNode.ID, userID); err != nil {
			return errors.Wrap(err, "can't save problem text")
		}

		nodes[id] = NodeWithKey{
			Node: *updatedNode,
		}
	}

	return nil
}

func (a *App) saveAssignmentText(url, id, name, lang, nodeID, userID string) error {
	filename := fmt.Sprintf("%s/assignments/%s.md", url, id)
	var err error
	mdContent, err := getFileContent(filename)
	if err != nil {
		return errors.Wrapf(err, "can't get file content %s", filename)
	}
	if strings.Contains(mdContent, "404: Not Found") {
		return nil
	}

	aName := fmt.Sprintf("Assignment: %s", name)
	if lang == model.LanguageGeorgian {
		aName = fmt.Sprintf("დავალება: %s", name)
	}
	if _, err := a.Store.Text().Save(&model.Text{
		Name:     aName,
		Text:     mdContent,
		NodeID:   nodeID,
		AuthorID: userID,
	}); err != nil && !strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
		return errors.Wrap(err, "can't save problem text")
	}
	return nil
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
	}); err != nil && !strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
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
	}); err != nil && !strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
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
	}); err != nil && !strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
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

func (a *App) importNodeQuestions(nodes map[string]NodeWithKey, url string) error {
	for id, node := range nodes {
		filename := fmt.Sprintf("%s/questions/%s.json", url, id)
		jsonContent, err := getFileContent(filename)
		if err != nil {
			return errors.Wrapf(err, "can't get %s file\n%s", filename, jsonContent)
		}
		if strings.Contains(jsonContent, "404: Not Found") {
			continue
		}
		question, err := model.QuestionFromJSON(strings.NewReader(jsonContent))
		if err != nil {
			return errors.Wrapf(err, "can't convert jsonContent to question - %s", jsonContent)
		}
		question.NodeID = node.ID
		if _, err := a.Store.Question().Save(question); err != nil && !strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
			return errors.Wrap(err, "can't save question")
		}
	}
	return nil
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
		}); err != nil && !strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
			return errors.Wrap(err, "can't save text")
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
