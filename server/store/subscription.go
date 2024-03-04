package store

import (
	sq "github.com/Masterminds/squirrel"

	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

type SubscriptionStore interface {
	Save(subscription *model.Subscription) (*model.Subscription, error)
	Update(subscription *model.Subscription) (*model.Subscription, error)
}

type SQLSubscriptionStore struct {
	sqlStore *SQLStore
}

func NewSubscriptionStore(db *SQLStore) SubscriptionStore {
	return &SQLSubscriptionStore{
		sqlStore: db,
	}
}

func (ss *SQLSubscriptionStore) Save(subscription *model.Subscription) (*model.Subscription, error) {
	_, err := ss.sqlStore.execBuilder(ss.sqlStore.db, sq.
		Insert("subscriptions").
		SetMap(map[string]interface{}{
			"subscription_id": subscription.ID,
			"customer_id":     subscription.CustomerID,
			"plan_id":         subscription.PlanID,
			"status":          subscription.Status,
			"created_at":      subscription.CreatedAt,
		}),
	)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create subscription")
	}

	return subscription, nil
}

func (ss *SQLSubscriptionStore) Update(subscription *model.Subscription) (*model.Subscription, error) {
	_, err := ss.sqlStore.execBuilder(ss.sqlStore.db, sq.
		Update("subscriptions").
		SetMap(map[string]interface{}{
			"status": subscription.Status,
		}).
		Where("subscription_id = ?", subscription.ID),
	)
	if err != nil {
		return nil, errors.Wrap(err, "failed to update subscription")
	}

	return subscription, nil
}
