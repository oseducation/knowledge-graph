package model

import (
	"encoding/json"
	"io"

	"github.com/pkg/errors"
)

// UserNodeNote type defines users note on the specific node
type UserNodeNote struct {
	UserID   string `json:"user_id" db:"user_id"`
	NodeID   string `json:"node_id" db:"node_id"`
	NoteName string `json:"note_name" db:"note_name"`
	Note     string `json:"note" db:"note"`
}

// IsValid validates the UserNodeNote and returns an error if it isn't configured correctly.
func (u *UserNodeNote) IsValid() error {
	if !IsValidID(u.UserID) {
		return invalidUserNodeNoteError("userID", u.UserID)
	}
	if !IsValidID(u.NodeID) {
		return invalidUserNodeNoteError("nodeID", u.NodeID)
	}
	return nil
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
