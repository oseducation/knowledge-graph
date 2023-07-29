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
		if preference.Key == "language" {
			if err := a.Store.User().UpdateLanguage(userID, preference.Value); err != nil {
				return errors.New("can't update user language")
			}
		}
	}
	return a.Store.Preferences().Save(preferences)
}
