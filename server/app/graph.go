package app

import (
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

func (a *App) ConstructGraph() error {
	page := 0
	perPage := 10000
	if a.Graph == nil {
		a.Graph = &model.Graph{}
	}
	for {
		options := &model.EdgeGetOptions{}
		model.ComposeEdgeOptions(model.EdgePage(page), model.EdgePerPage(perPage))(options)
		edges, err := a.Store.Graph().GetEdges(options)
		if err != nil {
			return errors.Wrapf(err, "can't get edges for options - %v", options)
		}
		if len(edges) == 0 {
			break
		}
		for _, edge := range edges {
			if _, ok := a.Graph.Prerequisites[edge.FromNodeID]; !ok {
				a.Graph.Prerequisites[edge.FromNodeID] = []string{}
			}
			if _, ok := a.Graph.Prerequisites[edge.ToNodeID]; !ok {
				a.Graph.Prerequisites[edge.ToNodeID] = []string{}
			}
			a.Graph.Prerequisites[edge.ToNodeID] = append(a.Graph.Prerequisites[edge.ToNodeID], edge.FromNodeID)
		}
		page++
	}
	page = 0
	for {
		options := &model.NodeGetOptions{}
		model.ComposeNodeOptions(model.NodePage(page), model.NodePerPage(perPage), model.NodeDeleted(false))(options)
		nodes, err := a.Store.Node().GetNodes(options)
		if err != nil {
			return errors.Wrapf(err, "can't get nodes for options - %v", options)
		}
		if len(nodes) == 0 {
			return nil
		}
		for _, node := range nodes {
			if _, ok := a.Graph.Nodes[node.ID]; !ok {
				a.Graph.Nodes[node.ID] = *node
			}
		}
	}
}
