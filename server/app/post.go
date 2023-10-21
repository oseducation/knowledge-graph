package app

import (
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// CreatePost creates new node
func (a *App) CreatePost(post *model.Post) (*model.Post, error) {
	rpost, err := a.Store.Post().Save(post)
	if err != nil {
		return nil, errors.Wrapf(err, "can't save post")
	}

	go func() {
		if err := a.SendPostToNodeNotificationEmail(post); err != nil {
			a.Log.Error("can't send email notification for post to node", log.Err(err))
		}
	}()

	return rpost, nil
}

// GetPosts gets filtered posts
func (a *App) GetPosts(options *model.PostGetOptions) ([]*model.Post, error) {
	posts, err := a.Store.Post().GetPosts(options)
	if err != nil {
		return nil, errors.Wrapf(err, "options = %v", options)
	}
	return posts, nil
}

func (a *App) GetPostsWithUserData(locationID string) ([]*model.PostWithUser, error) {
	posts, err := a.Store.Post().GetPostsWithUser(locationID)
	if err != nil {
		return nil, errors.Wrapf(err, "locationID = %v", locationID)
	}
	return posts, nil
}

// UpdatePost updates post
func (a *App) UpdatePost(post *model.Post) error {
	if err := a.Store.Post().Update(post); err != nil {
		return errors.Wrapf(err, "post = %s", post.ID)
	}
	return nil
}

// DeletePost deletes post
func (a *App) DeletePost(post *model.Post) error {
	if err := a.Store.Post().Delete(post); err != nil {
		return errors.Wrapf(err, "node = %s", post.ID)
	}
	return nil
}

// GetPost gets post
func (a *App) GetPost(postID string) (*model.Post, error) {
	post, err := a.Store.Post().Get(postID)
	if err != nil {
		return nil, errors.Wrapf(err, "postID = %v", postID)
	}
	return post, nil
}
