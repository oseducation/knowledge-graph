package model

import (
	"encoding/json"
	"io"

	"github.com/pkg/errors"
)

type Preference struct {
	UserID string `json:"user_id" db:"user_id"`
	Key    string `json:"key" db:"key"`
	Value  string `json:"value" db:"value"`
}

func (p *Preference) IsValid() error {
	if !IsValidID(p.UserID) {
		return errors.New("not a user id")
	}

	if len(p.Key) > 32 {
		return errors.New("invalid key")
	}

	if len(p.Value) > 32 {
		return errors.New("invalid value")
	}
	return nil
}

// PreferencesFromJSON will decode the input and return preferences
func PreferencesFromJSON(data io.Reader) ([]Preference, error) {
	var preferences []Preference
	if err := json.NewDecoder(data).Decode(&preferences); err != nil {
		return nil, errors.Wrap(err, "can't decode preferences")
	}
	return preferences, nil
}
