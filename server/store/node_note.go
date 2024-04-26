package store

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// NodeNoteStore is an interface to crud users's notes on node
type NodeNoteStore interface {
	SaveOrUpdate(nodeNote *model.UserNodeNote) error
	Update(new *model.UserNodeNote) error
	GetNotesForUser(userID string) ([]*model.UserNodeNote, error)
	GetNoteForUserNode(userID, nodeID, noteName string) (*model.UserNodeNote, error)
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
			"nn.user_id",
			"nn.node_id",
			"nn.note_name",
			"nn.note",
		).
		From("user_node_notes nn")

	return &SQLNodeNoteStore{
		sqlStore:        db,
		nodeNotesSelect: nodeNotesSelect,
	}
}

func (nn *SQLNodeNoteStore) SaveOrUpdate(nodeNote *model.UserNodeNote) error {
	if err := nodeNote.IsValid(); err != nil {
		return err
	}

	oldNote, err := nn.GetNoteForUserNode(nodeNote.UserID, nodeNote.NodeID, nodeNote.NoteName)
	if err != nil && oldNote.Note != nodeNote.Note {
		return nn.Update(nodeNote)
	}

	_, err = nn.sqlStore.execBuilder(nn.sqlStore.db, nn.sqlStore.builder.
		Insert("user_node_notes").
		SetMap(map[string]interface{}{
			"user_id":   nodeNote.UserID,
			"node_id":   nodeNote.NodeID,
			"note_name": nodeNote.NoteName,
			"note":      nodeNote.Note,
		}))
	if err != nil {
		return errors.Wrapf(err, "can't save user node note with note name:%s for user:%s", nodeNote.NoteName, nodeNote.UserID)
	}
	return nil
}

func (nn *SQLNodeNoteStore) Update(new *model.UserNodeNote) error {
	if err := new.IsValid(); err != nil {
		return err
	}

	_, err := nn.sqlStore.execBuilder(nn.sqlStore.db, nn.sqlStore.builder.
		Update("user_node_notes").
		SetMap(map[string]interface{}{
			"note": new.Note,
		}).
		Where(sq.And{
			sq.Eq{"user_id": new.UserID},
			sq.Eq{"node_id": new.NodeID},
			sq.Eq{"note_name": new.NoteName},
		}))
	if err != nil {
		return errors.Wrapf(err, "failed to update note for user with id '%s'", new.UserID)
	}

	return nil
}

func (nn *SQLNodeNoteStore) GetNotesForUser(userID string) ([]*model.UserNodeNote, error) {
	var userNotes []*model.UserNodeNote
	if err := nn.sqlStore.selectBuilder(nn.sqlStore.db, &userNotes,
		nn.nodeNotesSelect.Where(sq.And{
			sq.Eq{"user_id": userID},
		})); err != nil {
		return nil, errors.Wrapf(err, "can't get all the notes")
	}
	return userNotes, nil
}

func (nn *SQLNodeNoteStore) GetNoteForUserNode(userID, nodeID, noteName string) (*model.UserNodeNote, error) {
	var userNote model.UserNodeNote
	if err := nn.sqlStore.getBuilder(nn.sqlStore.db, &userNote,
		nn.nodeNotesSelect.Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.Eq{"node_id": nodeID},
			sq.Eq{"note_name": noteName},
		})); err != nil {
		return nil, errors.Wrapf(err, "can't get note for %s note_name", noteName)
	}
	return &userNote, nil
}
