package model

import (
	"encoding/json"
	"io"

	"github.com/pkg/errors"
)

// UserNodeCode type defines users code on the specific node
type UserNodeCode struct {
	UserID   string `json:"user_id" db:"user_id"`
	NodeID   string `json:"node_id" db:"node_id"`
	CodeName string `json:"code_name" db:"code_name"`
	Code     string `json:"code" db:"code"`
}

// IsValid validates the UserNodeCode and returns an error if it isn't configured correctly.
func (u *UserNodeCode) IsValid() error {
	if !IsValidID(u.UserID) {
		return invalidUserCodeError("userID", u.UserID)
	}
	if !IsValidID(u.NodeID) {
		return invalidUserCodeError("nodeID", u.NodeID)
	}
	return nil
}

// UserCodeFromJSON will decode the input and return a UserCode
func UserCodeFromJSON(data io.Reader) (*UserNodeCode, error) {
	var userCode *UserNodeCode
	if err := json.NewDecoder(data).Decode(&userCode); err != nil {
		return nil, errors.Wrap(err, "can't decode user")
	}
	return userCode, nil
}

func invalidUserCodeError(fieldName string, fieldValue any) error {
	return errors.Errorf("invalid user code error. %s=%v", fieldName, fieldValue)
}
