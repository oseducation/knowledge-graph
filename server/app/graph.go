package app

import (
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

func (a *App) GetFrontEndGraph(language string) *model.FrontendGraph {
	gr := model.FrontendGraph{}
	gr.Nodes = make([]model.FrontendNodes, 0, len(a.Graph.Nodes))
	nodesMap := map[string]struct{}{}
	for _, node := range a.Graph.Nodes {
		if node.Lang != language {
			continue
		}
		gr.Nodes = append(gr.Nodes, model.FrontendNodes{
			ID:          node.ID,
			Name:        node.Name,
			Description: node.Description,
			NodeType:    node.NodeType,
			Status:      model.NodeStatusUnseen,
			ParentID:    node.ParentID,
		})
		nodesMap[node.ID] = struct{}{}
	}
	gr.Links = []model.FrontendLinks{}
	for nodeID, prereqs := range a.Graph.Prerequisites {
		if _, ok := nodesMap[nodeID]; !ok {
			continue
		}
		for _, prereq := range prereqs {
			if _, ok := nodesMap[prereq]; !ok {
				continue
			}
			gr.Links = append(gr.Links, model.FrontendLinks{
				Source: prereq,
				Target: nodeID,
			})
		}
	}

	return &gr
}

func (a *App) GetNextNodes(userID string) ([]model.Node, []model.Node, error) {
	statuses, err := a.GetStatusesForUser(userID)
	if err != nil {
		return nil, nil, errors.Wrapf(err, "can't get statuses for user %s", userID)
	}
	statusMap := map[string]*model.NodeStatusForUser{}
	for _, status := range statuses {
		statusMap[status.NodeID] = status
	}

	inProgressNodes := []model.Node{}
	nextNodes := []model.Node{}

	for _, node := range a.Graph.Nodes {
		status, ok := statusMap[node.ID]
		if !ok { // it's an unseen node, which can be the next node, let's check it
			if a.hasNodeFinishedAllPrerequisites(node.ID, statusMap) {
				nextNodes = append(nextNodes, node)
			}
			continue
		}
		if status.Status == model.NodeStatusStarted || status.Status == model.NodeStatusWatched {
			inProgressNodes = append(inProgressNodes, node)
		} else if status.Status == model.NodeStatusUnseen || status.Status == "" {
			if a.hasNodeFinishedAllPrerequisites(node.ID, statusMap) {
				nextNodes = append(nextNodes, node)
			}
		}
	}
	return inProgressNodes, nextNodes, nil
}

func (a *App) GetGraphForUser(userID string) (*model.FrontendGraph, error) {
	statuses, err := a.GetStatusesForUser(userID)
	if err != nil {
		return nil, errors.Wrap(err, "can't get statuses for user")
	}
	statusMap := map[string]*model.NodeStatusForUser{}
	for _, status := range statuses {
		statusMap[status.NodeID] = status
	}

	user, err := a.Store.User().Get(userID)
	if err != nil {
		return nil, errors.Wrap(err, "can't get user")
	}

	gr := a.GetFrontEndGraph(user.Lang)
	for i, node := range gr.Nodes {
		if status, ok := statusMap[node.ID]; ok {
			gr.Nodes[i].Status = status.Status
		}
	}

	return gr, nil
}

func (a *App) populateUserKnowledge(answers map[string]bool, userID string) error {
	finishedNodes := map[string]bool{}
	for nodeID, seen := range answers {
		if !seen {
			continue
		}
		nodes := a.getAllPrerequisiteNodes(nodeID)
		for _, node := range nodes {
			finishedNodes[node] = true
		}
	}
	for nodeID := range finishedNodes {
		status := &model.NodeStatusForUser{
			NodeID:    nodeID,
			UserID:    userID,
			Status:    model.NodeStatusFinished,
			UpdatedAt: model.GetMillis(),
		}
		if err := a.UpdateStatus(status); err != nil {
			return errors.Wrapf(err, "can't update status for user %s, node %s", userID, nodeID)
		}
	}
	return nil
}

func (a *App) getAllPrerequisiteNodes(nodeID string) []string {
	visited := make(map[string]bool)
	var result []string
	dfs(a.Graph, nodeID, &result, visited)
	return result

}

func (a *App) hasNodeFinishedAllPrerequisites(nodeID string, statuses map[string]*model.NodeStatusForUser) bool {
	prereqs, ok := a.Graph.Prerequisites[nodeID]
	if !ok {
		return true
	}
	for _, prereq := range prereqs {
		prereqStatus, ok2 := statuses[prereq]
		if !ok2 || prereqStatus.Status != model.NodeStatusFinished {
			return false
		}
	}
	return true
}

// dfs performs a depth-first search to collect all prerequisite nodes.
func dfs(graph *model.Graph, nodeID string, result *[]string, visited map[string]bool) {
	if visited[nodeID] {
		return
	}
	visited[nodeID] = true
	for _, prereq := range graph.Prerequisites[nodeID] {
		dfs(graph, prereq, result, visited)
	}
	*result = append(*result, nodeID)
}
