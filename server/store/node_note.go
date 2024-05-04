package store

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// NodeNoteStore is an interface to crud users's notes on node
type NodeNoteStore interface {
	Save(nodeNote *model.UserNodeNote) (*model.UserNodeNote, error)
	Update(new *model.UserNodeNote) error
	Delete(new *model.UserNodeNote) error
	Get(id string) (*model.UserNodeNote, error)
	GetNotesForUser(userID string) ([]*model.UserNodeNote, error)
}

// SQLNodeNoteStore is a struct to store users's notes on a node
type SQLNodeNoteStore struct {
	sqlStore        *SQLStore
	nodeNotesSelect sq.SelectBuilder
}

// NewNodeNoteStore creates a new store for user's notes on a node.
func NewNodeNoteStore(db *SQLStore) NodeNoteStore {
	nodeNotesSelect := db.builder.
		Select(
			"nn.id",
			"nn.user_id",
			"nn.node_id",
			"nn.note_name",
			"nn.note",
			"nn.created_at",
			"nn.updated_at",
			"nn.deleted_at",
		).
		From("user_node_notes nn")

	return &SQLNodeNoteStore{
		sqlStore:        db,
		nodeNotesSelect: nodeNotesSelect,
	}
}

func (nn *SQLNodeNoteStore) Save(nodeNote *model.UserNodeNote) (*model.UserNodeNote, error) {
	if nodeNote.ID != "" {
		return nil, errors.New("invalid input")
	}
	nodeNote.BeforeSave()
	if err := nodeNote.IsValid(); err != nil {
		return nil, err
	}

	_, err := nn.sqlStore.execBuilder(nn.sqlStore.db, nn.sqlStore.builder.
		Insert("user_node_notes").
		SetMap(map[string]interface{}{
			"id":         nodeNote.ID,
			"user_id":    nodeNote.UserID,
			"node_id":    nodeNote.NodeID,
			"note_name":  nodeNote.NoteName,
			"note":       nodeNote.Note,
			"created_at": nodeNote.CreatedAt,
			"updated_at": nodeNote.UpdatedAt,
			"deleted_at": nodeNote.DeletedAt,
		}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't save user node note with note name:%s for user:%s", nodeNote.NoteName, nodeNote.UserID)
	}
	return nodeNote, nil
}

func (nn *SQLNodeNoteStore) Update(new *model.UserNodeNote) error {
	new.BeforeUpdate()

	if err := new.IsValid(); err != nil {
		return err
	}

	_, err := nn.sqlStore.execBuilder(nn.sqlStore.db, nn.sqlStore.builder.
		Update("user_node_notes").
		SetMap(map[string]interface{}{
			"note":       new.Note,
			"note_name":  new.NoteName,
			"updated_at": new.UpdatedAt,
		}).
		Where(sq.And{
			sq.Eq{"id": new.ID},
		}))
	if err != nil {
		return errors.Wrapf(err, "failed to update note for user with id '%s'", new.UserID)
	}

	return nil
}

func (nn *SQLNodeNoteStore) Delete(note *model.UserNodeNote) error {
	_, err := nn.sqlStore.execBuilder(nn.sqlStore.db, nn.sqlStore.builder.
		Update("user_node_notes").
		SetMap(map[string]interface{}{
			"deleted_at": model.GetMillis(),
		}).
		Where(sq.And{
			sq.Eq{"id": note.ID},
		}))
	if err != nil {
		return errors.Wrapf(err, "failed to delete note for user with id '%s'", note.ID)
	}

	return nil
}

// Get gets note by id
func (nn *SQLNodeNoteStore) Get(id string) (*model.UserNodeNote, error) {
	var userNote model.UserNodeNote
	if err := nn.sqlStore.getBuilder(nn.sqlStore.db, &userNote, nn.nodeNotesSelect.Where(sq.Eq{"nn.id": id})); err != nil {
		return nil, errors.Wrapf(err, "can't get note by id: %s", id)
	}
	return &userNote, nil
}

func (nn *SQLNodeNoteStore) GetNotesForUser(userID string) ([]*model.UserNodeNote, error) {
	var userNotes []*model.UserNodeNote
	if err := nn.sqlStore.selectBuilder(nn.sqlStore.db, &userNotes,
		nn.nodeNotesSelect.Where(sq.And{
			sq.Eq{"user_id": userID},
		}).OrderBy("nn.updated_at DESC")); err != nil {
		return nil, errors.Wrapf(err, "can't get all the notes")
	}
	return userNotes, nil
}
