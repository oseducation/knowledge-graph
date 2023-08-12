package store

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

type TextStore interface {
	Save(text *model.Text) (*model.Text, error)
	Get(id string) (*model.Text, error)
	GetTexts(options *model.TextGetOptions) ([]*model.Text, error)
	Delete(text *model.Text) error
}

// SQLTextStore is a struct to store text
type SQLTextStore struct {
	sqlStore   *SQLStore
	textSelect sq.SelectBuilder
}

// NewTextStore creates a new store for texts.
func NewTextStore(db *SQLStore) TextStore {
	textSelect := db.builder.
		Select(
			"t.id",
			"t.created_at",
			"t.updated_at",
			"t.deleted_at",
			"t.name",
			"t.text",
			"v.node_id",
			"v.author_id",
		).
		From("texts t")

	return &SQLTextStore{
		sqlStore:   db,
		textSelect: textSelect,
	}
}

// Save saves text in the DB
func (ts *SQLTextStore) Save(text *model.Text) (*model.Text, error) {
	if text.ID != "" {
		return nil, errors.New("invalid input")
	}
	text.BeforeSave()
	if err := text.IsValid(); err != nil {
		return nil, err
	}

	_, err := ts.sqlStore.execBuilder(ts.sqlStore.db, ts.sqlStore.builder.
		Insert("texts").
		SetMap(map[string]interface{}{
			"id":         text.ID,
			"created_at": text.CreatedAt,
			"updated_at": text.UpdatedAt,
			"deleted_at": text.DeletedAt,
			"name":       text.Name,
			"text":       text.Text,
			"node_id":    text.NodeID,
			"author_id":  text.AuthorID,
		}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't save text with name:%s", text.Name)
	}
	return text, nil
}

// Get gets text by id
func (ts *SQLTextStore) Get(id string) (*model.Text, error) {
	var text model.Text
	if err := ts.sqlStore.getBuilder(ts.sqlStore.db, &text, ts.textSelect.Where(sq.Eq{"t.id": id})); err != nil {
		return nil, errors.Wrapf(err, "can't get text by id: %s", id)
	}
	return &text, nil
}

// GetTexts gets texts with options
func (ts *SQLTextStore) GetTexts(options *model.TextGetOptions) ([]*model.Text, error) {
	var texts []*model.Text
	query := ts.textSelect
	if options.WithAuthorUsername {
		query = ts.sqlStore.builder.Select(
			"t.id",
			"t.created_at",
			"t.updated_at",
			"t.deleted_at",
			"t.name",
			"t.text",
			"t.node_id",
			"t.author_id",
			"u.username AS author_username",
		).From("texts t").Join("users u on u.id = t.author_id")
	}
	if options.NodeID != "" {
		query = query.Where(sq.Eq{"t.node_id": options.NodeID})
	}
	if options.PerPage > 0 {
		query = query.Limit(uint64(options.PerPage))
	}
	if options.Page >= 0 {
		query = query.Offset(uint64(options.Page * options.PerPage))
	}

	if err := ts.sqlStore.selectBuilder(ts.sqlStore.db, &texts, query); err != nil {
		return nil, errors.Wrapf(err, "can't get texts with options %v", options)
	}

	return texts, nil
}

// Delete removes text
func (ts *SQLTextStore) Delete(text *model.Text) error {
	curTime := model.GetMillis()

	_, err := ts.sqlStore.execBuilder(ts.sqlStore.db, ts.sqlStore.builder.
		Update("texts").
		SetMap(map[string]interface{}{
			"deleted_at": curTime,
		}).
		Where(sq.Eq{"id": text.ID}))
	if err != nil {
		return errors.Wrapf(err, "failed to delete text with id '%s'", text.ID)
	}

	return nil
}
