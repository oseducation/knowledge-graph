package store

import (
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// UserInteractionStore is an interface to crud interactions
type UserInteractionStore interface {
	Save(userInteraction *model.UserInteraction) error
}

// SQLUserInteractionStore is a struct to store users's interactions
type SQLUserInteractionStore struct {
	sqlStore *SQLStore
}

// NewUserInteractionStore creates a new store for user's interactions.
func NewUserInteractionStore(db *SQLStore) UserInteractionStore {
	return &SQLUserInteractionStore{
		sqlStore: db,
	}
}

func (uis *SQLUserInteractionStore) Save(userInteraction *model.UserInteraction) error {
	if err := userInteraction.IsValid(); err != nil {
		return err
	}

	_, err := uis.sqlStore.execBuilder(uis.sqlStore.db, uis.sqlStore.builder.
		Insert("user_interactions").
		SetMap(map[string]interface{}{
			"id":                userInteraction.ID,
			"user_id":           userInteraction.UserID,
			"start_date":        userInteraction.StartDate,
			"end_date":          userInteraction.EndDate,
			"url":               userInteraction.URL,
			"ui_component_name": userInteraction.UIComponentName,
			"tag":               userInteraction.Tag,
		}))
	if err != nil {
		return errors.Wrapf(err, "can't save user interaction for user:%s", userInteraction.UserID)
	}
	return nil
}
