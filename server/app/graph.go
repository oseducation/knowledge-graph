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
