package app

import (
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// GetVideo gets video by id
func (a *App) GetVideo(id string) (*model.Video, error) {
	video, err := a.Store.Video().Get(id)
	if err != nil {
		return nil, errors.Wrapf(err, "id = %s", id)
	}
	return video, nil
}

// GetVideos gets filtered videos
func (a *App) GetVideos(options *model.VideoGetOptions) ([]*model.Video, error) {
	videos, err := a.Store.Video().GetVideos(options)
	if err != nil {
		return nil, errors.Wrapf(err, "options = %v", options)
	}
	return videos, nil
}

func (a *App) AddUserEngagement(userID, videoID string, data *model.UserEngagementData) error {
	return a.Store.Video().AddUserVideoEngagement(userID, videoID, data)
}

// GetNextVideo returns video user can watch
func (a *App) GetNextVideo(userID string) (string, error) {
	inProgressNodes, nextNodes, err := a.GetNextNodes(userID)
	if err != nil {
		return "", errors.Wrap(err, "can't get next nodes")
	}

	if len(nextNodes) == 0 && len(inProgressNodes) == 0 {
		return "", errors.New("you've finished all the nodes")
	}

	nodeList := [][]model.Node{nextNodes, inProgressNodes}
	for _, nodes := range nodeList {
		if len(nodes) != 0 {
			videoKeys, err := a.getVideosFromNodes(nodes)
			if err != nil {
				return "", err
			}
			if len(videoKeys) != 0 {
				index := a.Random.Intn(len(videoKeys))
				return videoKeys[index], nil
			}
		}
	}

	return "", errors.New("no videos in the next or in progress nodes")
}

func (a *App) getVideosFromNodes(nodes []model.Node) ([]string, error) {
	nodeIDs := make([]string, 0, len(nodes))
	for i := range nodes {
		nodeIDs = append(nodeIDs, nodes[i].ID)
	}
	videos, err := a.Store.Video().GetVideosFromNodeIDs(nodeIDs)
	if err != nil {
		return nil, errors.Wrap(err, "can't get nodes with videos")
	}
	return videos, nil
}
