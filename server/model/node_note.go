package model

import (
	"encoding/json"
	"io"

	"github.com/pkg/errors"
)

// UserNodeNote type defines users note on the specific node
type UserNodeNote struct {
	ID        string `json:"id" db:"id"`
	UserID    string `json:"user_id" db:"user_id"`
	NodeID    string `json:"node_id" db:"node_id"`
	NoteName  string `json:"note_name" db:"note_name"`
	Note      string `json:"note" db:"note"`
	CreatedAt int64  `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt int64  `json:"updated_at,omitempty" db:"updated_at"`
	DeletedAt int64  `json:"deleted_at" db:"deleted_at"`
}

// IsValid validates the UserNodeNote and returns an error if it isn't configured correctly.
func (u *UserNodeNote) IsValid() error {
	if !IsValidID(u.ID) {
		return invalidUserNodeNoteError("id", u.ID)
	}
	if !IsValidID(u.UserID) {
		return invalidUserNodeNoteError("userID", u.UserID)
	}
	if !IsValidID(u.NodeID) {
		return invalidUserNodeNoteError("nodeID", u.NodeID)
	}

	if u.CreatedAt == 0 {
		return invalidUserNodeNoteError("create_at", u.CreatedAt)
	}

	if u.UpdatedAt == 0 {
		return invalidUserNodeNoteError("updated_at", u.UpdatedAt)
	}

	return nil
}

// BeforeSave should be called before storing the note
func (u *UserNodeNote) BeforeSave() {
	u.ID = NewID()
	if u.CreatedAt == 0 {
		u.CreatedAt = GetMillis()
	}
	u.UpdatedAt = u.CreatedAt

	u.NoteName = SanitizeUnicode(u.NoteName)
	u.Note = SanitizeUnicode(u.Note)
}

// BeforeUpdate should be run before updating the note in the db.
func (u *UserNodeNote) BeforeUpdate() {
	u.NoteName = SanitizeUnicode(u.NoteName)
	u.Note = SanitizeUnicode(u.Note)

	u.UpdatedAt = GetMillis()
}

// UserNodeNoteJSON will decode the input and return a UserNodeNote
func UserNodeNoteJSON(data io.Reader) (*UserNodeNote, error) {
	var userNote *UserNodeNote
	if err := json.NewDecoder(data).Decode(&userNote); err != nil {
		return nil, errors.Wrap(err, "can't decode user note")
	}
	return userNote, nil
}

func invalidUserNodeNoteError(fieldName string, fieldValue any) error {
	return errors.Errorf("invalid user note error. %s=%v", fieldName, fieldValue)
}
