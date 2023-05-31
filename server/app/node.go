package app

import (
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

const defaultVideoPerPage = 20

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

// GetNode gets node
func (a *App) GetNode(nodeID string) (*model.NodeWithResources, error) {
	node, err := a.Store.Node().Get(nodeID)
	if err != nil {
		return nil, errors.Wrapf(err, "nodeID = %v", nodeID)
	}
	options := &model.VideoGetOptions{}
	model.ComposeVideoOptions(
		model.WithAuthorUsername(),
		model.NodeID(nodeID),
		model.VideoPage(0),
		model.VideoPerPage(defaultVideoPerPage))(options)
	videos, err := a.Store.Video().GetVideos(options)
	if err != nil {
		return nil, errors.Wrapf(err, "options = %v", options)
	}
	users, err := a.Store.User().ActiveUsers(nodeID)
	if err != nil {
		return nil, errors.Wrapf(err, "nodeID = %v", nodeID)
	}
	return &model.NodeWithResources{Node: *node, Videos: videos, ActiveUsers: a.sanitizeUsers(users)}, nil
}

// GetVideos gets filtered videos
func (a *App) GetVideos(options *model.VideoGetOptions) ([]*model.Video, error) {
	videos, err := a.Store.Video().GetVideos(options)
	if err != nil {
		return nil, errors.Wrapf(err, "options = %v", options)
	}
	return videos, nil
}

func (a *App) GetStatusesForUser(userID string) ([]*model.NodeStatusForUser, error) {
	return a.Store.Node().GetNodesForUser(userID)
}

func (a *App) UpdateStatus(status *model.NodeStatusForUser) error {
	if err := status.IsValid(); err != nil {
		return errors.Wrap(err, "status not valid")
	}
	return a.Store.Node().UpdateStatus(status)
}
