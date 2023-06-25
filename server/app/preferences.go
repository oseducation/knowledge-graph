package app

import (
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

func (a *App) GetPreferencesForUser(userID string) ([]model.Preference, error) {
	return a.Store.Preferences().GetAll(userID)
}

func (a *App) UpdatePreferencesForUser(userID string, preferences []model.Preference) error {
	for _, preference := range preferences {
		if userID != preference.UserID {
			return errors.New("user_id mismatch")
		}
	}
	return a.Store.Preferences().Save(preferences)
}
