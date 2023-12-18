package store

import (
	"database/sql"
	"sort"

	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// GoalStore is an interface to crud goals
type GoalStore interface {
	Save(userID, nodeID string) error
	Reset(userID, nodeID string) error
	Finish(userID, nodeID string) error
	Delete(userID, nodeID string) error
	GetAll(userID string) ([]*model.Goal, error)
	GetAllWithData(userID string) ([]*model.GoalWithData, error)
	Get(userID, nodeID string) (*model.Goal, error)
	SaveDefaultGoal(nodeID string, num int64) error
	NextDefaultGoalForUser(userID string) (string, error)
}

// SQLGoalStore is a struct to store goals
type SQLGoalStore struct {
	sqlStore   *SQLStore
	goalSelect sq.SelectBuilder
}

// NewGoalStore creates a new store for goals.
func NewGoalStore(db *SQLStore) GoalStore {
	goalSelect := db.builder.
		Select(
			"g.user_id",
			"g.node_id",
			"g.created_at",
			"g.finished_at",
			"g.deleted_at",
		).
		From("user_goals g")

	return &SQLGoalStore{
		sqlStore:   db,
		goalSelect: goalSelect,
	}
}

// Save saves goal in the DB
func (gs *SQLGoalStore) Save(userID, nodeID string) error {
	goal := &model.Goal{
		UserID: userID,
		NodeID: nodeID,
	}
	goal.BeforeSave()
	if err := goal.IsValid(); err != nil {
		return err
	}

	_, err := gs.sqlStore.execBuilder(gs.sqlStore.db, gs.sqlStore.builder.
		Insert("user_goals").
		SetMap(map[string]interface{}{
			"user_id":     goal.UserID,
			"node_id":     goal.NodeID,
			"created_at":  goal.CreatedAt,
			"finished_at": goal.FinishedAt,
			"deleted_at":  goal.DeletedAt,
		}))
	if err != nil {
		return errors.Wrapf(err, "can't save goal for user: %s node :%s", goal.UserID, goal.NodeID)
	}
	return nil
}

// Update updates goal in the DB
func (gs *SQLGoalStore) Reset(userID, nodeID string) error {
	_, err := gs.sqlStore.execBuilder(gs.sqlStore.db, gs.sqlStore.builder.
		Update("user_goals").
		SetMap(map[string]interface{}{
			"deleted_at": 0,
		}).
		Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.Eq{"node_id": nodeID},
			sq.Eq{"finished_at": 0},
		}))
	if err != nil {
		return errors.Wrapf(err, "can't reset goal for user: %s node :%s", userID, nodeID)
	}
	return nil
}

// Delete removes goal
func (gs *SQLGoalStore) Delete(userID, nodeID string) error {
	curTime := model.GetMillis()

	_, err := gs.sqlStore.execBuilder(gs.sqlStore.db, gs.sqlStore.builder.
		Update("user_goals").
		SetMap(map[string]interface{}{
			"deleted_at": curTime,
		}).
		Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.Eq{"node_id": nodeID},
		}))
	if err != nil {
		return errors.Wrapf(err, "failed to delete goal for user: '%s' node'%s'", userID, nodeID)
	}

	return nil
}

// Finish marks goal as finished
func (gs *SQLGoalStore) Finish(userID, nodeID string) error {
	curTime := model.GetMillis()

	_, err := gs.sqlStore.execBuilder(gs.sqlStore.db, gs.sqlStore.builder.
		Update("user_goals").
		SetMap(map[string]interface{}{
			"finished_at": curTime,
		}).
		Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.Eq{"node_id": nodeID},
		}))
	if err != nil {
		return errors.Wrapf(err, "failed to finish goal for user: '%s' node'%s'", userID, nodeID)
	}

	return nil
}

func (gs *SQLGoalStore) Get(userID, nodeID string) (*model.Goal, error) {
	var goal model.Goal
	if err := gs.sqlStore.getBuilder(gs.sqlStore.db, &goal,
		gs.goalSelect.Where(
			sq.And{
				sq.Eq{"g.user_id": userID},
				sq.Eq{"g.node_id": nodeID},
			},
		)); err != nil {
		return nil, errors.Wrapf(err, "can't get goal for user: %s", userID)
	}
	return &goal, nil
}

// GetAll gets goals for user
func (gs *SQLGoalStore) GetAll(userID string) ([]*model.Goal, error) {
	var goals []*model.Goal
	if err := gs.sqlStore.selectBuilder(gs.sqlStore.db, &goals,
		gs.goalSelect.Where(
			sq.And{
				sq.Eq{"g.deleted_at": 0},
				sq.Eq{"g.finished_at": 0},
				sq.Eq{"g.user_id": userID},
			},
		)); err != nil {
		return nil, errors.Wrapf(err, "can't get goals for user: %s", userID)
	}
	return goals, nil
}

// GetAllWithData gets goals for user with additional data
func (gs *SQLGoalStore) GetAllWithData(userID string) ([]*model.GoalWithData, error) {
	var goals []*model.GoalWithData

	query := gs.sqlStore.builder.
		Select(
			"n.id AS node_id",
			"n.name",
			"n.thumbnail_url as thumbnail_relative_url",
		).
		From("user_goals g").
		Join("nodes n ON n.id = g.node_id").
		Where(sq.And{
			sq.Eq{"g.deleted_at": 0},
			sq.Eq{"g.finished_at": 0},
			sq.Eq{"g.user_id": userID},
		})

	if err := gs.sqlStore.selectBuilder(gs.sqlStore.db, &goals, query); err != nil {
		return nil, errors.Wrapf(err, "can't get goals for user: %s", userID)
	}
	return goals, nil
}

func (gs *SQLGoalStore) SaveDefaultGoal(nodeID string, num int64) error {
	_, err := gs.sqlStore.execBuilder(gs.sqlStore.db, gs.sqlStore.builder.
		Insert("default_goals").
		SetMap(map[string]interface{}{
			"node_id": nodeID,
			"num":     num,
		}))
	if err != nil {
		return errors.Wrapf(err, "can't save default goal nodeID :%s", nodeID)
	}
	return nil
}

// NextDefaultGoalForUser returns next default goal for a specific user
func (gs *SQLGoalStore) NextDefaultGoalForUser(userID string) (string, error) {
	type DefaultGoal struct {
		NodeID string         `json:"node_id" db:"node_id"`
		Num    int64          `json:"num" db:"num"`
		Status sql.NullString `json:"status" db:"status"`
	}
	var goals []DefaultGoal

	subQuery := sq.Select("*").
		From("user_nodes u").
		Where(sq.Eq{"u.user_id": userID}).
		Prefix("LEFT JOIN (").
		Suffix(") un ON un.node_id = dg.node_id")

	query := sq.Select("dg.node_id, dg.num, un.status").
		From("default_goals dg").JoinClause(subQuery)

	if err := gs.sqlStore.selectBuilder(gs.sqlStore.db, &goals, query); err != nil {
		return "", errors.Wrap(err, "can't get default goals")
	}

	sort.Slice(goals, func(i, j int) bool {
		return goals[i].Num > goals[j].Num
	})
	nodeIDs := make([]string, len(goals))
	for i := range goals {
		nodeIDs[i] = goals[i].NodeID
	}

	for _, goal := range goals {
		if !goal.Status.Valid || goal.Status.String != model.NodeStatusFinished {
			return goal.NodeID, nil
		}
	}
	return "", nil
}
