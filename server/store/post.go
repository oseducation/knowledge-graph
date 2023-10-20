package store

import (
	"fmt"

	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// PostStore is an interface to crud posts
type PostStore interface {
	Save(post *model.Post) (*model.Post, error)
	Update(new *model.Post) error
	Get(id string) (*model.Post, error)
	GetPosts(options *model.PostGetOptions) ([]*model.Post, error)
	Delete(post *model.Post) error
}

// SQLPostStore is a struct to store posts
type SQLPostStore struct {
	sqlStore   *SQLStore
	postSelect sq.SelectBuilder
}

// NewPostStore creates a new store for posts.
func NewPostStore(db *SQLStore) PostStore {
	postSelect := db.builder.
		Select(
			"p.id",
			"p.created_at",
			"p.updated_at",
			"p.deleted_at",
			"p.location_id",
			"p.user_id",
			"p.message",
		).
		From("posts p")

	return &SQLPostStore{
		sqlStore:   db,
		postSelect: postSelect,
	}
}

// Save saves post in the DB
func (ps *SQLPostStore) Save(post *model.Post) (*model.Post, error) {
	if post.ID != "" {
		return nil, errors.New("invalid input")
	}
	post.BeforeSave()
	if err := post.IsValid(); err != nil {
		return nil, err
	}

	_, err := ps.sqlStore.execBuilder(ps.sqlStore.db, ps.sqlStore.builder.
		Insert("posts").
		SetMap(map[string]interface{}{
			"id":          post.ID,
			"created_at":  post.CreatedAt,
			"updated_at":  post.UpdatedAt,
			"deleted_at":  post.DeletedAt,
			"user_id":     post.UserID,
			"location_id": post.LocationID,
			"message":     post.Message,
		}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't save post:%s from: %s to location: %s", post.Message, post.UserID, post.LocationID)
	}
	return post, nil
}

// Update updates post
func (ps *SQLPostStore) Update(new *model.Post) error {
	new.BeforeUpdate()

	if err := new.IsValid(); err != nil {
		return err
	}

	_, err := ps.sqlStore.execBuilder(ps.sqlStore.db, ps.sqlStore.builder.
		Update("posts").
		SetMap(map[string]interface{}{
			"created_at":  new.CreatedAt,
			"updated_at":  new.UpdatedAt,
			"deleted_at":  new.DeletedAt,
			"user_id":     new.UserID,
			"location_id": new.LocationID,
			"message":     new.Message,
		}).
		Where(sq.Eq{"ID": new.ID}))
	if err != nil {
		return errors.Wrapf(err, "failed to update post with id '%s'", new.ID)
	}

	return nil
}

// Get gets post by id
func (ps *SQLPostStore) Get(id string) (*model.Post, error) {
	var post model.Post
	if err := ps.sqlStore.getBuilder(ps.sqlStore.db, &post, ps.postSelect.Where(sq.Eq{"p.id": id})); err != nil {
		return nil, errors.Wrapf(err, "can't get post by id: %s", id)
	}
	return &post, nil
}

// GetPosts gets posts with options
func (ps *SQLPostStore) GetPosts(options *model.PostGetOptions) ([]*model.Post, error) {
	var posts []*model.Post
	query := ps.postSelect
	if options.TermInMessage != "" {
		query = query.Where(sq.Like{"p.message": fmt.Sprint("%", options.TermInMessage, "%")})
	}
	if !options.IncludeDeleted {
		query = query.Where("n.deleted_at = 0")
	}
	if options.UserID != "" {
		query = query.Where(sq.Eq{"p.user_id": options.UserID})
	}
	if options.LocationID != "" {
		query = query.Where(sq.Eq{"p.location_id": options.LocationID})
	}
	if options.PerPage > 0 {
		query = query.Limit(uint64(options.PerPage))
	}
	if options.Page >= 0 {
		query = query.Offset(uint64(options.Page * options.PerPage))
	}

	if err := ps.sqlStore.selectBuilder(ps.sqlStore.db, &posts, query); err != nil {
		return nil, errors.Wrapf(err, "can't get posts with options %v", options)
	}
	return posts, nil
}

// Delete removes post
func (ps *SQLPostStore) Delete(post *model.Post) error {
	curTime := model.GetMillis()

	_, err := ps.sqlStore.execBuilder(ps.sqlStore.db, ps.sqlStore.builder.
		Update("posts").
		SetMap(map[string]interface{}{
			"deleted_at": curTime,
		}).
		Where(sq.Eq{"id": post.ID}))
	if err != nil {
		return errors.Wrapf(err, "failed to delete post with id '%s'", post.ID)
	}

	return nil
}
