package model

import (
	"encoding/json"
	"io"

	"github.com/pkg/errors"
)

// UserInteraction type defines users' interaction with the app
type UserInteraction struct {
	ID              string `json:"id" db:"id"`
	UserID          string `json:"user_id" db:"user_id"`
	StartDate       int64  `json:"start_date" db:"start_date"`
	EndDate         int64  `json:"end_date" db:"end_date"`
	URL             string `json:"url" db:"url"`
	UIComponentName string `json:"ui_component_name" db:"ui_component_name"`
	Tag             string `json:"tag" db:"tag"`
}

// IsValid validates the UserInteraction and returns an error if it isn't configured correctly.
func (u *UserInteraction) IsValid() error {
	if !IsValidID(u.ID) {
		return invalidInteractionError("id", u.UserID)
	}
	if !IsValidID(u.UserID) {
		return invalidUserCodeError("userID", u.UserID)
	}
	return nil
}

// UserInteractionFromJSON will decode the input and return a UserInteraction
func UserInteractionFromJSON(data io.Reader) (*UserInteraction, error) {
	var interaction *UserInteraction
	if err := json.NewDecoder(data).Decode(&interaction); err != nil {
		return nil, errors.Wrap(err, "can't decode UserInteraction")
	}
	return interaction, nil
}

func invalidInteractionError(fieldName string, fieldValue any) error {
	return errors.Errorf("invalid interaction error. %s=%v", fieldName, fieldValue)
}
