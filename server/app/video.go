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
