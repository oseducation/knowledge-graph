package store

import (
	"database/sql"
	"fmt"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// NodeStore is an interface to crud nodes
type NodeStore interface {
	Save(node *model.Node) (*model.Node, error)
	Update(new *model.Node) error
	Get(id string) (*model.Node, error)
	GetByName(name string) (*model.Node, error)
	GetNodes(options *model.NodeGetOptions) ([]*model.Node, error)
	Delete(node *model.Node) error
	GetNodesForUser(userID string) ([]*model.NodeStatusForUser, error)
	UpdateStatus(status *model.NodeStatusForUser) error
	GetPrerequisites(id string) ([]*model.Node, error)
	GetNodesWithIDs(ids []string) ([]*model.Node, error)
	GetNumberOfFinishedNodes(userID string) (int, error)
	GetNumberOfNodesInDaysWithStatus(userID string, days int, status string) (int, error)
	GetFinishedNodesProgress(userID string) (map[string]int, error)
	TopPerformers(days, n int) ([]model.PerformerUser, error)
	LearningSteak(userID string) (currentSteak int, maxSteak int, finishedToday bool, err error)
}

// SQLNodeStore is a struct to store nodes
type SQLNodeStore struct {
	sqlStore   *SQLStore
	nodeSelect sq.SelectBuilder
}

// NewNodeStore creates a new store for nodes.
func NewNodeStore(db *SQLStore) NodeStore {
	nodeSelect := db.builder.
		Select(
			"n.id",
			"n.created_at",
			"n.updated_at",
			"n.deleted_at",
			"n.name",
			"n.description",
			"n.node_type",
			"n.lang",
			"n.environment",
			"n.parent_id",
			"n.thumbnail_url",
		).
		From("nodes n")

	return &SQLNodeStore{
		sqlStore:   db,
		nodeSelect: nodeSelect,
	}
}

// Save saves node in the DB
func (ns *SQLNodeStore) Save(node *model.Node) (*model.Node, error) {
	if node.ID != "" {
		return nil, errors.New("invalid input")
	}
	node.BeforeSave()
	if err := node.IsValid(); err != nil {
		return nil, err
	}

	_, err := ns.sqlStore.execBuilder(ns.sqlStore.db, ns.sqlStore.builder.
		Insert("nodes").
		SetMap(map[string]interface{}{
			"id":            node.ID,
			"created_at":    node.CreatedAt,
			"updated_at":    node.UpdatedAt,
			"deleted_at":    node.DeletedAt,
			"name":          node.Name,
			"description":   node.Description,
			"node_type":     node.NodeType,
			"lang":          node.Lang,
			"environment":   node.Environment,
			"parent_id":     node.ParentID,
			"thumbnail_url": node.ThumbnailURL,
		}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't save node with name:%s", node.Name)
	}
	return node, nil
}

// Update updates node
func (ns *SQLNodeStore) Update(new *model.Node) error {
	new.BeforeUpdate()

	if err := new.IsValid(); err != nil {
		return err
	}

	_, err := ns.sqlStore.execBuilder(ns.sqlStore.db, ns.sqlStore.builder.
		Update("nodes").
		SetMap(map[string]interface{}{
			"created_at":    new.CreatedAt,
			"updated_at":    new.UpdatedAt,
			"deleted_at":    new.DeletedAt,
			"name":          new.Name,
			"description":   new.Description,
			"node_type":     new.NodeType,
			"lang":          new.Lang,
			"environment":   new.Environment,
			"parent_id":     new.ParentID,
			"thumbnail_url": new.ThumbnailURL,
		}).
		Where(sq.Eq{"ID": new.ID}))
	if err != nil {
		return errors.Wrapf(err, "failed to update node with id '%s'", new.ID)
	}

	return nil
}

// Get gets node by id
func (ns *SQLNodeStore) Get(id string) (*model.Node, error) {
	var node model.Node
	if err := ns.sqlStore.getBuilder(ns.sqlStore.db, &node, ns.nodeSelect.Where(sq.Eq{"n.id": id})); err != nil {
		return nil, errors.Wrapf(err, "can't get node by id: %s", id)
	}
	return &node, nil
}

// GetByName gets node by it's name
func (ns *SQLNodeStore) GetByName(name string) (*model.Node, error) {
	var node model.Node
	if err := ns.sqlStore.getBuilder(ns.sqlStore.db, &node, ns.nodeSelect.Where(sq.Eq{"n.name": name})); err != nil {
		return nil, errors.Wrapf(err, "can't get node by name: %s", name)
	}
	return &node, nil
}

// GetNodes gets nodes with options
func (ns *SQLNodeStore) GetNodes(options *model.NodeGetOptions) ([]*model.Node, error) {
	var nodes []*model.Node
	query := ns.nodeSelect
	if options.TermInName != "" {
		query = query.Where(sq.Like{"n.name": fmt.Sprint("%", options.TermInName, "%")})
	}
	if options.TermInDescription != "" {
		query = query.Where(sq.Like{"n.description": fmt.Sprint("%", options.TermInDescription, "%")})
	}
	if !options.IncludeDeleted {
		query = query.Where("n.deleted_at = 0")
	}
	if options.PerPage > 0 {
		query = query.Limit(uint64(options.PerPage))
	}
	if options.Page >= 0 {
		query = query.Offset(uint64(options.Page * options.PerPage))
	}

	if err := ns.sqlStore.selectBuilder(ns.sqlStore.db, &nodes, query); err != nil {
		return nil, errors.Wrapf(err, "can't get nodes with options %v", options)
	}
	return nodes, nil
}

// Delete removes node
func (ns *SQLNodeStore) Delete(node *model.Node) error {
	curTime := model.GetMillis()

	_, err := ns.sqlStore.execBuilder(ns.sqlStore.db, ns.sqlStore.builder.
		Update("nodes").
		SetMap(map[string]interface{}{
			"deleted_at": curTime,
		}).
		Where(sq.Eq{"id": node.ID}))
	if err != nil {
		return errors.Wrapf(err, "failed to delete node with id '%s'", node.ID)
	}

	return nil
}

func (ns *SQLNodeStore) GetNodesForUser(userID string) ([]*model.NodeStatusForUser, error) {
	var statuses []*model.NodeStatusForUser
	query := ns.sqlStore.builder.
		Select(
			"un.node_id",
			"un.user_id",
			"un.status",
			"un.updated_at",
		).
		From("user_nodes un").
		Where(sq.Eq{"user_id": userID})

	if err := ns.sqlStore.selectBuilder(ns.sqlStore.db, &statuses, query); err != nil {
		return nil, errors.Wrapf(err, "can't get node statuses for user_id %s", userID)
	}

	return statuses, nil
}

func (ns *SQLNodeStore) UpdateStatus(status *model.NodeStatusForUser) error {
	var statusValue string
	err := ns.sqlStore.getBuilder(ns.sqlStore.db, &statusValue, ns.sqlStore.builder.
		Select("status").
		From("user_nodes").
		Where(sq.And{
			sq.Eq{"user_id": status.UserID},
			sq.Eq{"node_id": status.NodeID},
		}))
	if err != nil && err != sql.ErrNoRows {
		return errors.Wrapf(err, "Can't update status -%v", status)
	}
	if statusValue == status.Status {
		return nil
	}

	if statusValue == model.NodeStatusWatched && status.Status != model.NodeStatusFinished {
		return nil
	}

	now := model.GetMillis()
	if err == nil {
		if _, err := ns.sqlStore.execBuilder(ns.sqlStore.db, ns.sqlStore.builder.
			Update("user_nodes").
			SetMap(map[string]interface{}{
				"status":     status.Status,
				"updated_at": now,
			}).
			Where(sq.And{
				sq.Eq{"user_id": status.UserID},
				sq.Eq{"node_id": status.NodeID},
			})); err != nil {
			return errors.Wrapf(err, "Can't update status -%v", status)
		}
	} else {
		if _, err := ns.sqlStore.execBuilder(ns.sqlStore.db, ns.sqlStore.builder.
			Insert("user_nodes").
			SetMap(map[string]interface{}{
				"status":     status.Status,
				"user_id":    status.UserID,
				"node_id":    status.NodeID,
				"updated_at": now,
			})); err != nil {
			return errors.Wrapf(err, "Can't insert status -%v", status)
		}
	}
	return nil
}

func (ns *SQLNodeStore) GetPrerequisites(id string) ([]*model.Node, error) {
	var nodes []*model.Node
	query := ns.nodeSelect.
		Join("edges e on n.id = e.from_node_id").
		Where(sq.Eq{"e.to_node_id": id})
	if err := ns.sqlStore.selectBuilder(ns.sqlStore.db, &nodes, query); err != nil {
		return nil, errors.Wrapf(err, "can't get prerequisite nodes for %s", id)
	}
	return nodes, nil
}

func (ns *SQLNodeStore) GetNodesWithIDs(ids []string) ([]*model.Node, error) {
	var nodes []*model.Node
	query := ns.nodeSelect.
		Where(sq.Eq{"n.id": ids})
	if err := ns.sqlStore.selectBuilder(ns.sqlStore.db, &nodes, query); err != nil {
		return nil, errors.Wrapf(err, "can't get nodes with ids %v", ids)
	}
	return nodes, nil
}

func (ns *SQLNodeStore) GetNumberOfFinishedNodes(userID string) (int, error) {
	var count int
	query := ns.sqlStore.builder.
		Select("COUNT(*)").
		From("user_nodes").
		Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.Eq{"status": model.NodeStatusFinished},
		})

	if err := ns.sqlStore.getBuilder(ns.sqlStore.db, &count, query); err != nil {
		return 0, errors.Wrapf(err, "can't get number of finished nodes for user %s", userID)
	}

	return count, nil
}

func (ns *SQLNodeStore) GetNumberOfNodesInDaysWithStatus(userID string, days int, status string) (int, error) {
	var count int
	daysAgo := time.Now().AddDate(0, 0, -days).UnixNano() / int64(time.Millisecond)

	query := ns.sqlStore.builder.
		Select("COUNT(*)").
		From("user_nodes").
		Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.Eq{"status": status},
			sq.Gt{"updated_at": daysAgo},
		})

	if err := ns.sqlStore.getBuilder(ns.sqlStore.db, &count, query); err != nil {
		return 0, errors.Wrapf(err, "can't get number of finished nodes this week for user %s", userID)
	}

	return count, nil
}

func (ns *SQLNodeStore) GetFinishedNodesProgress(userID string) (map[string]int, error) {
	type NodeProgress struct {
		Date          *string `db:"date"`
		FinishedCount *int    `db:"finished_count"`
	}
	var progress []*NodeProgress
	daysAgo := time.Now().AddDate(-1, 0, 0).UnixNano() / int64(time.Millisecond)

	query := ns.sqlStore.builder.Select(
		"TO_CHAR(TO_TIMESTAMP(updated_at), 'YYYY-MM-DD') AS date",
		"COUNT(node_id) AS finished_count",
	).From("user_nodes").
		Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.Eq{"status": model.NodeStatusFinished},
			sq.Gt{"updated_at": daysAgo},
		}).GroupBy("TO_CHAR(TO_TIMESTAMP(updated_at), 'YYYY-MM-DD')")

	if ns.sqlStore.db.DriverName() == "sqlite3" {
		query = ns.sqlStore.builder.Select(
			"DATE(datetime(updated_at / 1000, 'unixepoch')) AS date",
			"COUNT(node_id) AS finished_count",
		).From("user_nodes").
			Where(sq.And{
				sq.Eq{"user_id": userID},
				sq.Eq{"status": model.NodeStatusFinished},
				sq.Gt{"updated_at": daysAgo},
			}).GroupBy("DATE(datetime(updated_at / 1000, 'unixepoch'))")
	}

	if err := ns.sqlStore.selectBuilder(ns.sqlStore.db, &progress, query); err != nil {
		return nil, errors.Wrapf(err, "can't get finished nodes progress for user %s", userID)
	}

	m := make(map[string]int)
	for _, node := range progress {
		m[*node.Date] = *node.FinishedCount
	}

	return m, nil
}

// TopPerformers returns top performers for the last days.
// if days is 0 then it returns all time top performers
func (ns *SQLNodeStore) TopPerformers(days, n int) ([]model.PerformerUser, error) {
	daysAgo := time.Now().AddDate(0, -days, 0).UnixNano() / int64(time.Millisecond)

	query := ns.sqlStore.builder.Select(
		"u.id",
		"u.first_name",
		"u.last_name",
		"u.username",
		"COUNT(un.node_id) AS finished_count",
	).From("users u").
		Join("user_nodes un on un.user_id = u.id").
		Where(sq.And{
			sq.Eq{"un.status": model.NodeStatusFinished},
			sq.Gt{"un.updated_at": daysAgo},
		}).GroupBy("u.id").
		OrderBy("finished_count DESC").Limit(uint64(n))

	var users []model.PerformerUser
	if err := ns.sqlStore.selectBuilder(ns.sqlStore.db, &users, query); err != nil {
		return nil, errors.Wrap(err, "can't get top performers")
	}
	return users, nil
}

func (ns *SQLNodeStore) LearningSteak(userID string) (currentSteak int, maxSteak int, finishedToday bool, err error) {
	type NodeProgress struct {
		Date          *string `db:"date"`
		FinishedCount *int    `db:"finished_count"`
	}
	var progress []*NodeProgress

	query := ns.sqlStore.builder.Select(
		"TO_CHAR(TO_TIMESTAMP(updated_at), 'YYYY-MM-DD') AS date",
		"COUNT(node_id) AS finished_count",
	).From("user_nodes").
		Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.Eq{"status": model.NodeStatusFinished},
		}).GroupBy("TO_CHAR(TO_TIMESTAMP(updated_at), 'YYYY-MM-DD')")

	if ns.sqlStore.db.DriverName() == "sqlite3" {
		query = ns.sqlStore.builder.Select(
			"DATE(datetime(updated_at / 1000, 'unixepoch')) AS date",
			"COUNT(node_id) AS finished_count",
		).From("user_nodes").
			Where(sq.And{
				sq.Eq{"user_id": userID},
				sq.Eq{"status": model.NodeStatusFinished},
			}).GroupBy("DATE(datetime(updated_at / 1000, 'unixepoch'))")
	}

	if err2 := ns.sqlStore.selectBuilder(ns.sqlStore.db, &progress, query); err2 != nil {
		return 0, 0, false, errors.Wrapf(err2, "can't get finished nodes for user %s", userID)
	}

	m := make(map[string]int)
	for _, node := range progress {
		m[*node.Date] = *node.FinishedCount
	}

	currentSteak = getCurrentSteak(m)
	maxSteak = getMaxSteak(m)
	finishedToday = getTodayProgress(m)
	if finishedToday {
		currentSteak++
	}
	err = nil
	return
}

func getMaxSteak(progress map[string]int) int {
	currentCount := 0
	maxCount := 0
	for day := 0; day < 366; day++ {
		d := time.Now().AddDate(0, 0, -day).Format("2006-01-02")
		if _, ok := progress[d]; !ok {
			if maxCount < currentCount {
				maxCount = currentCount
				currentCount = 0
			}
		} else {
			currentCount++
		}
	}
	if maxCount < currentCount {
		maxCount = currentCount
	}
	return maxCount
}

func getTodayProgress(progress map[string]int) bool {
	day := time.Now().Format("2006-01-02")
	if _, ok := progress[day]; !ok {
		return false
	}
	return true
}

func getCurrentSteak(progress map[string]int) int {
	counter := 0
	for {
		day := time.Now().AddDate(0, 0, -(counter + 1)).Format("2006-01-02")
		if _, ok := progress[day]; !ok {
			break
		}
		counter++
	}

	return counter
}
