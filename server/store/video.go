package store

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

type VideoStore interface {
	Save(video *model.Video) (*model.Video, error)
	Get(id string) (*model.Video, error)
	GetVideos(options *model.VideoGetOptions) ([]*model.Video, error)
	Delete(video *model.Video) error
}

// SQLVideoStore is a struct to store videos
type SQLVideoStore struct {
	sqlStore    *SQLStore
	videoSelect sq.SelectBuilder
}

// NewVideoStore creates a new store for videos.
func NewVideoStore(db *SQLStore) VideoStore {
	videoSelect := db.builder.
		Select(
			"v.id",
			"v.created_at",
			"v.deleted_at",
			"v.name",
			"v.video_type",
			"v.key",
			"v.length",
			"v.node_id",
			"v.author_id",
		).
		From("videos v")

	return &SQLVideoStore{
		sqlStore:    db,
		videoSelect: videoSelect,
	}
}

// Save saves video in the DB
func (vs *SQLVideoStore) Save(video *model.Video) (*model.Video, error) {
	if video.ID != "" {
		return nil, errors.New("invalid input")
	}
	video.BeforeSave()
	if err := video.IsValid(); err != nil {
		return nil, err
	}

	_, err := vs.sqlStore.execBuilder(vs.sqlStore.db, sq.
		Insert("videos").
		SetMap(map[string]interface{}{
			"id":         video.ID,
			"created_at": video.CreatedAt,
			"deleted_at": video.DeletedAt,
			"name":       video.Name,
			"video_type": video.VideoType,
			"key":        video.Key,
			"length":     video.Length,
			"node_id":    video.NodeID,
			"author_id":  video.AuthorID,
		}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't save video with key:%s", video.Key)
	}
	return video, nil
}

// Get gets video by id
func (vs *SQLVideoStore) Get(id string) (*model.Video, error) {
	var video model.Video
	if err := vs.sqlStore.getBuilder(vs.sqlStore.db, &video, vs.videoSelect.Where(sq.Eq{"n.id": id})); err != nil {
		return nil, errors.Wrapf(err, "can't get video by id: %s", id)
	}
	return &video, nil
}

// GetVideos gets nodes with options
func (vs *SQLVideoStore) GetVideos(options *model.VideoGetOptions) ([]*model.Video, error) {
	var videos []*model.Video
	query := vs.videoSelect
	if options.WithAuthorUsername {
		query = vs.sqlStore.builder.Select(
			"v.id",
			"v.created_at",
			"v.deleted_at",
			"v.name",
			"v.video_type",
			"v.key",
			"v.length",
			"v.node_id",
			"v.author_id",
			"u.username AS author_username",
		).From("videos v").Join("users u").Where("u.id == v.author_id")
	}
	if options.NodeID != "" {
		query = query.Where(sq.Eq{"v.node_id": options.NodeID})
	}
	if options.PerPage > 0 {
		query = query.Limit(uint64(options.PerPage))
	}
	if options.Page >= 0 {
		query = query.Offset(uint64(options.Page * options.PerPage))
	}

	if err := vs.sqlStore.selectBuilder(vs.sqlStore.db, &videos, query); err != nil {
		return nil, errors.Wrapf(err, "can't get videos with options %v", options)
	}
	return videos, nil
}

// Delete removes video
func (vs *SQLVideoStore) Delete(video *model.Video) error {
	curTime := model.GetMillis()

	_, err := vs.sqlStore.execBuilder(vs.sqlStore.db, sq.
		Update("videos").
		SetMap(map[string]interface{}{
			"deleted_at": curTime,
		}).
		Where(sq.Eq{"id": video.ID}))
	if err != nil {
		return errors.Wrapf(err, "failed to delete video with id '%s'", video.ID)
	}

	return nil
}
