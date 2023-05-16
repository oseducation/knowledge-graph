package app

import "github.com/oseducation/knowledge-graph/model"

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
