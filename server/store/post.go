package store

import (
	"encoding/json"
	"fmt"

	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

type sqlPost struct {
	model.Post
	PropsJSON string `db:"props"`
}

// PostStore is an interface to crud posts
type PostStore interface {
	Save(post *model.Post) (*model.Post, error)
	Update(new *model.Post) error
	Get(id string) (*model.Post, error)
	GetPosts(options *model.PostGetOptions) ([]*model.Post, error)
	CountPosts(options *model.PostGetOptions) (int, error)
	GetPostsWithUser(locationID string) ([]*model.PostWithUser, error)
	Delete(post *model.Post) error
	GetLastNPostsForLocation(n int, location string) ([]*model.Post, error)
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
			"p.post_type",
			"p.props",
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

	propsJSON, err := json.Marshal(post.Props)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to marshal props json: '%v'", post.Props)
	}

	_, err = ps.sqlStore.execBuilder(ps.sqlStore.db, ps.sqlStore.builder.
		Insert("posts").
		SetMap(map[string]interface{}{
			"id":          post.ID,
			"created_at":  post.CreatedAt,
			"updated_at":  post.UpdatedAt,
			"deleted_at":  post.DeletedAt,
			"user_id":     post.UserID,
			"location_id": post.LocationID,
			"message":     post.Message,
			"post_type":   post.PostType,
			"props":       propsJSON,
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

	propsJSON, err := json.Marshal(new.Props)
	if err != nil {
		return errors.Wrapf(err, "failed to marshal props json: '%v'", new.Props)
	}

	_, err = ps.sqlStore.execBuilder(ps.sqlStore.db, ps.sqlStore.builder.
		Update("posts").
		SetMap(map[string]interface{}{
			"created_at":  new.CreatedAt,
			"updated_at":  new.UpdatedAt,
			"deleted_at":  new.DeletedAt,
			"user_id":     new.UserID,
			"location_id": new.LocationID,
			"message":     new.Message,
			"post_type":   new.PostType,
			"props":       propsJSON,
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

func (ps *SQLPostStore) CountPosts(options *model.PostGetOptions) (int, error) {
	query := ps.sqlStore.builder.Select("Count(*)").From("posts p")
	query = filterPosts(options, query)

	var count int
	if err := ps.sqlStore.getBuilder(ps.sqlStore.db, &count, query); err != nil {
		return 0, errors.Wrapf(err, "can't get posts with options %v", options)
	}
	return count, nil
}

func filterPosts(options *model.PostGetOptions, query sq.SelectBuilder) sq.SelectBuilder {
	if options.TermInMessage != "" {
		query = query.Where(sq.Like{"p.message": fmt.Sprint("%", options.TermInMessage, "%")})
	}
	if !options.IncludeDeleted {
		query = query.Where("p.deleted_at = 0")
	}
	if options.UserID != "" {
		query = query.Where(sq.Eq{"p.user_id": options.UserID})
	}
	if options.LocationID != "" {
		query = query.Where(sq.Eq{"p.location_id": options.LocationID})
	}
	if options.PostType != "" {
		query = query.Where(sq.Eq{"p.post_type": options.PostType})
	}
	if options.After > 0 {
		query = query.Where(sq.Gt{"p.created_at": options.After})
	}
	if options.Before > 0 {
		query = query.Where(sq.Lt{"p.created_at": options.Before})
	}
	if options.LastX > 0 {
		return query.OrderBy("p.created_at DESC").Limit(uint64(options.LastX))
	}
	if options.PerPage > 0 {
		query = query.Limit(uint64(options.PerPage))
	}
	if options.Page >= 0 {
		query = query.Offset(uint64(options.Page * options.PerPage))
	}
	return query
}

// GetPosts gets posts with options
func (ps *SQLPostStore) GetPosts(options *model.PostGetOptions) ([]*model.Post, error) {
	var sqlPosts []*sqlPost
	query := filterPosts(options, ps.postSelect)

	if err := ps.sqlStore.selectBuilder(ps.sqlStore.db, &sqlPosts, query); err != nil {
		return nil, errors.Wrapf(err, "can't get posts with options %v", options)
	}
	posts := make([]*model.Post, len(sqlPosts))

	for i, p := range sqlPosts {
		if err := json.Unmarshal([]byte(p.PropsJSON), &p.Props); err != nil {
			return nil, errors.Wrapf(err, "failed to unmarshal props json: '%s'", p.PropsJSON)
		}
		if options.LastX > 0 {
			posts[len(sqlPosts)-1-i] = &p.Post
		} else {
			posts[i] = &p.Post
		}
	}
	return posts, nil
}

func (ps *SQLPostStore) GetLastNPostsForLocation(n int, location string) ([]*model.Post, error) {
	var sqlPosts []*sqlPost
	query := ps.postSelect.Where(
		sq.Eq{"location_id": location}).
		OrderBy("created_at DESC").
		Limit(uint64(n))

	if err := ps.sqlStore.selectBuilder(ps.sqlStore.db, &sqlPosts, query); err != nil {
		return nil, errors.Wrapf(err, "can't get %d posts on location %s", n, location)
	}

	posts := make([]*model.Post, 0, len(sqlPosts))
	for _, p := range sqlPosts {
		if err := json.Unmarshal([]byte(p.PropsJSON), &p.Props); err != nil {
			return nil, errors.Wrapf(err, "failed to unmarshal props json: '%s'", p.PropsJSON)
		}
		posts = append(posts, &p.Post)
	}
	return posts, nil
}

// GetPosts gets posts with options
func (ps *SQLPostStore) GetPostsWithUser(locationID string) ([]*model.PostWithUser, error) {
	type PostWUser struct {
		ID        string `json:"id" db:"id"`
		Message   string `json:"message" db:"message"`
		UserName  string `json:"username" db:"username"`
		FirstName string `json:"first_name" db:"first_name"`
		LastName  string `json:"last_name" db:"last_name"`
		UserID    string `json:"user_id" db:"user_id"`
	}
	var postWUser []PostWUser
	query := ps.sqlStore.builder.
		Select(
			"p.id",
			"p.message",
			"u.username",
			"u.first_name",
			"u.last_name",
			"u.id as user_id",
		).
		From("posts p").
		Join("users u ON u.id = p.user_id").
		Where(sq.Eq{"p.location_id": locationID}).
		OrderBy("p.created_at DESC").
		Limit(100). //TODO: make it configurable
		Offset(0)

	if err := ps.sqlStore.selectBuilder(ps.sqlStore.db, &postWUser, query); err != nil {
		return nil, errors.Wrapf(err, "can't get posts from location %v", locationID)
	}
	posts := make([]*model.PostWithUser, 0, len(postWUser))
	for i := len(postWUser) - 1; i >= 0; i-- {
		p := postWUser[i]
		posts = append(posts, &model.PostWithUser{
			Post: model.Post{
				ID:      p.ID,
				Message: p.Message,
			},
			User: &model.User{
				Username:  p.UserName,
				FirstName: p.FirstName,
				LastName:  p.LastName,
				ID:        p.UserID,
			},
		})
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
