package app

import (
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

func (a *App) GetFrontEndGraph() *model.FrontendGraph {
	gr := model.FrontendGraph{}
	gr.Nodes = make([]model.FrontendNodes, 0, len(a.Graph.Nodes))
	for _, node := range a.Graph.Nodes {
		gr.Nodes = append(gr.Nodes, model.FrontendNodes{
			ID:          node.ID,
			Name:        node.Name,
			Description: node.Description,
			NodeType:    node.NodeType,
			Status:      model.NodeStatusUnseen,
		})
	}
	gr.Links = []model.FrontendLinks{}
	for nodeID, prereqs := range a.Graph.Prerequisites {
		for _, prereq := range prereqs {
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
		if ok && (status.Status == model.NodeStatusStarted || status.Status == model.NodeStatusWatched) {
			inProgressNodes = append(inProgressNodes, node)
		} else if !ok || status.Status != model.NodeStatusFinished {
			prereqs, ok2 := a.Graph.Prerequisites[node.ID]
			if !ok2 {
				return nil, nil, errors.Wrapf(err, "no prerequisites for node %s", node.ID)
			}
			isNext := true
			for _, prereq := range prereqs {
				prereqStatus, ok3 := statusMap[prereq]
				if !ok3 || prereqStatus.Status != model.NodeStatusFinished {
					isNext = false
					break
				}
			}

			if isNext || !ok {
				nextNodes = append(nextNodes, node)
			}
		}
	}
	return inProgressNodes, nextNodes, nil
}
