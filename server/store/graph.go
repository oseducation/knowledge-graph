package store

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// GraphStore is an interface to crud graph edges
type GraphStore interface {
	Save(edge *model.Edge) error
	GetEdges(options *model.EdgeGetOptions) ([]*model.Edge, error)
	Delete(node *model.Edge) error
}

// SQLGraphStore is a struct to store graph
type SQLGraphStore struct {
	sqlStore    *SQLStore
	graphSelect sq.SelectBuilder
}

// NewGraphStore creates a new store for a graph.
func NewGraphStore(db *SQLStore) GraphStore {
	graphSelect := db.builder.
		Select(
			"e.from_node_id",
			"e.to_node_id",
		).
		From("edges e")

	return &SQLGraphStore{
		sqlStore:    db,
		graphSelect: graphSelect,
	}
}

// Save saves edge in the DB
func (gs *SQLGraphStore) Save(edge *model.Edge) error {
	if _, err := gs.sqlStore.execBuilder(gs.sqlStore.db, sq.
		Insert("edges").
		SetMap(map[string]interface{}{
			"from_node_id": edge.FromNodeID,
			"to_node_id":   edge.ToNodeID,
		})); err != nil {
		return errors.Wrapf(err, "can't save edge:%v", edge)
	}
	return nil
}

// GetEdges gets edges with options
func (gs *SQLGraphStore) GetEdges(options *model.EdgeGetOptions) ([]*model.Edge, error) {
	var edges []*model.Edge
	query := gs.graphSelect
	if options.FromNodeID != "" {
		query = query.Where(sq.Eq{"g.from_node_id": options.FromNodeID})
	}
	if options.ToNodeID != "" {
		query = query.Where(sq.Eq{"g.to_node_id": options.ToNodeID})
	}
	if options.PerPage > 0 {
		query = query.Limit(uint64(options.PerPage))
	}
	if options.Page > 0 {
		query = query.Offset(uint64(options.Page))
	}

	if err := gs.sqlStore.selectBuilder(gs.sqlStore.db, &edges, query); err != nil {
		return nil, errors.Wrapf(err, "can't get edges with options %v", options)
	}
	return edges, nil
}

// Delete removes edge
func (gs *SQLGraphStore) Delete(edge *model.Edge) error {
	if _, err := gs.sqlStore.execBuilder(gs.sqlStore.db, sq.
		Delete("edges").
		Where(sq.And{
			sq.Eq{"g.from_node_id": edge.FromNodeID},
			sq.Eq{"g.to_node_id": edge.ToNodeID},
		})); err != nil {
		return errors.Wrapf(err, "failed to delete edge '%v'", edge)
	}

	return nil
}
