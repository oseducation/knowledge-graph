package store

import (
	"database/sql"

	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

type VideoStore interface {
	Save(video *model.Video) (*model.Video, error)
	Get(id string) (*model.Video, error)
	GetVideos(options *model.VideoGetOptions) ([]*model.Video, error)
	Delete(video *model.Video) error
	AddUserVideoEngagement(userID, videoID string, userEngagementData *model.UserEngagementData) error
	GetVideosFromNodeIDs(nodeIDs []string) ([]string, error)
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

	_, err := vs.sqlStore.execBuilder(vs.sqlStore.db, vs.sqlStore.builder.
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
	if err := vs.sqlStore.getBuilder(vs.sqlStore.db, &video, vs.videoSelect.Where(sq.Eq{"v.id": id})); err != nil {
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
		).From("videos v").Join("users u on u.id = v.author_id")
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

	_, err := vs.sqlStore.execBuilder(vs.sqlStore.db, vs.sqlStore.builder.
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

func (vs *SQLVideoStore) AddUserVideoEngagement(userID, videoID string, userEngagementData *model.UserEngagementData) error {
	curTime := model.GetMillis()

	query := vs.sqlStore.builder.Select(
		"uv.last_watched_at",
		"uv.times_finished",
		"uv.times_started",
		"uv.times_abandoned",
		"uv.last_abandoned_after",
	).From("user_videos uv").Where(sq.And{
		sq.Eq{"uv.video_id": videoID},
		sq.Eq{"uv.user_id": userID},
	})

	type videoEngagement struct {
		LastWatchedAt      uint64 `json:"last_watched_at" db:"last_watched_at"`
		TimesFinished      uint64 `json:"times_finished" db:"times_finished"`
		TimesStarted       uint64 `json:"times_started" db:"times_started"`
		TimesAbandoned     uint64 `json:"times_abandoned" db:"times_abandoned"`
		LastAbandonedAfter uint64 `json:"last_abandoned_after" db:"last_abandoned_after"`
	}

	var engagement videoEngagement

	firstEngagement := false
	if err := vs.sqlStore.getBuilder(vs.sqlStore.db, &engagement, query); err != nil {
		if err == sql.ErrNoRows {
			firstEngagement = true
		} else {
			return errors.Wrapf(err, "can't get user video engagement with userID %s and videoID %s", userID, videoID)
		}
	}

	if firstEngagement {
		if userEngagementData.VideoStatus != model.VideoStatusStarted {
			vs.sqlStore.logger.Error("wrong video status", log.String("expected", model.VideoStatusStarted), log.String("actual", userEngagementData.VideoStatus))
		}
		_, err := vs.sqlStore.execBuilder(vs.sqlStore.db, vs.sqlStore.builder.
			Insert("user_videos").
			SetMap(map[string]interface{}{
				"user_id":              userID,
				"video_id":             videoID,
				"last_watched_at":      curTime,
				"times_finished":       0,
				"times_started":        1,
				"times_abandoned":      0,
				"last_abandoned_after": 0,
			}))
		if err != nil {
			return errors.Wrapf(err, "failed to insert video engagement with with userID %s and videoID %s", userID, videoID)
		}
		return nil
	}

	if userEngagementData.VideoStatus == model.VideoStatusFinished {
		engagement.TimesFinished++
	} else if userEngagementData.VideoStatus == model.VideoStatusStarted {
		engagement.TimesStarted++
	} else if userEngagementData.VideoStatus == model.VideoStatusAbandoned {
		engagement.TimesAbandoned++
		engagement.LastAbandonedAfter = userEngagementData.AbandonWatchingAt
	}
	_, err := vs.sqlStore.execBuilder(vs.sqlStore.db, vs.sqlStore.builder.
		Update("user_videos").
		SetMap(map[string]interface{}{
			"last_watched_at":      curTime,
			"times_finished":       engagement.TimesFinished,
			"times_started":        engagement.TimesStarted,
			"times_abandoned":      engagement.TimesAbandoned,
			"last_abandoned_after": engagement.LastAbandonedAfter,
		}).
		Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.Eq{"video_id": videoID},
		}))
	if err != nil {
		return errors.Wrapf(err, "failed to update video engagement with with userID %s and videoID %s", userID, videoID)
	}
	return nil
}

func (vs *SQLVideoStore) GetVideosFromNodeIDs(nodeIDs []string) ([]string, error) {
	query := vs.sqlStore.builder.Select(
		"v.key",
	).From("videos v").Where(sq.Eq{"v.node_id": nodeIDs})

	var videoKeys []string

	if err := vs.sqlStore.selectBuilder(vs.sqlStore.db, &videoKeys, query); err != nil {
		return nil, errors.Wrapf(err, "can't get videos for nodeIDS options %v", nodeIDs)
	}

	return videoKeys, nil
}
