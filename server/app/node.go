package app

import (
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// CreateNode creates new node
func (a *App) CreateNode(node *model.Node) (*model.Node, error) {
	rnode, err := a.Store.Node().Save(node)
	if err != nil {
		return nil, errors.Wrapf(err, "nodeID = %s", node.ID)
	}
	return rnode, nil
}

// GetNodes gets filtered nodes
func (a *App) GetNodes(options *model.NodeGetOptions) ([]*model.Node, error) {
	nodes, err := a.Store.Node().GetNodes(options)
	if err != nil {
		return nil, errors.Wrapf(err, "options = %v", options)
	}
	return nodes, nil
}

// UpdateNode updates node
func (a *App) UpdateNode(node *model.Node) error {
	if err := a.Store.Node().Update(node); err != nil {
		return errors.Wrapf(err, "node = %s", node.ID)
	}
	return nil
}

// DeleteNode deletes node
func (a *App) DeleteNode(node *model.Node) error {
	if err := a.Store.Node().Delete(node); err != nil {
		return errors.Wrapf(err, "node = %s", node.ID)
	}
	return nil
}
