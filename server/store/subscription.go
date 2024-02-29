package store

import (
	sq "github.com/Masterminds/squirrel"

	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

type SubscriptionStore interface {
	Create(subscription *model.Subscription) (*model.Subscription, error)
	Get(userID string) (*model.Subscription, error)
	Update(subscription *model.Subscription) error
	Delete(userID string) error
}

type SQLSubscriptionStore struct {
	sqlStore           *SQLStore
	subscriptionSelect sq.SelectBuilder
}

func NewSubscriptionStore(db *SQLStore) SubscriptionStore {
	subscriptionSelect := db.builder.
		Select(
			"s.id",
			"s.user_id",
			"s.customer_id",
			"s.subscription_id",
			"s.price_id",
			"s.active",
			"s.created_at",
			"s.updated_at",
			"s.deleted_at",
		).
		From("subscriptions s")

	return &SQLSubscriptionStore{
		sqlStore:           db,
		subscriptionSelect: subscriptionSelect,
	}
}

func (ss *SQLSubscriptionStore) Create(subscription *model.Subscription) (*model.Subscription, error) {
	if subscription.ID != "" {
		return nil, errors.New("invalid input")
	}

	subscription.ID = model.NewID()
	subscription.CreatedAt = model.GetMillis()
	subscription.UpdatedAt = subscription.CreatedAt

	_, err := ss.sqlStore.execBuilder(ss.sqlStore.db, sq.
		Insert("subscriptions").
		SetMap(map[string]interface{}{
			"id":              subscription.ID,
			"user_id":         subscription.UserID,
			"customer_id":     subscription.CustomerID,
			"subscription_id": subscription.SubscriptionID,
			"price_id":        subscription.PriceID,
			"active":          subscription.Active,
			"created_at":      subscription.CreatedAt,
			"updated_at":      subscription.UpdatedAt,
		}),
	)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create subscription")
	}

	return subscription, nil
}

func (ss *SQLSubscriptionStore) Get(userID string) (*model.Subscription, error) {
	subscription := &model.Subscription{}
	err := ss.sqlStore.getBuilder(ss.sqlStore.db, subscription, ss.subscriptionSelect.Where(sq.Eq{"user_id": userID}))
	if err != nil {
		return nil, errors.Wrap(err, "failed to get subscription")
	}
	return subscription, nil
}

func (ss *SQLSubscriptionStore) Update(subscription *model.Subscription) error {
	subscription.UpdatedAt = model.GetMillis()

	_, err := ss.sqlStore.execBuilder(ss.sqlStore.db, sq.
		Update("subscriptions").
		SetMap(map[string]interface{}{
			"customer_id":     subscription.CustomerID,
			"subscription_id": subscription.SubscriptionID,
			"price_id":        subscription.PriceID,
			"active":          subscription.Active,
			"updated_at":      subscription.UpdatedAt,
		}).
		Where(sq.Eq{"id": subscription.ID}),
	)
	if err != nil {
		return errors.Wrap(err, "failed to update subscription")
	}

	return nil
}

func (ss *SQLSubscriptionStore) Delete(userID string) error {
	_, err := ss.sqlStore.execBuilder(ss.sqlStore.db, sq.
		Update("subscriptions").
		SetMap(map[string]interface{}{
			"deleted_at": model.GetMillis(),
		}).
		Where(sq.Eq{"user_id": userID}),
	)
	if err != nil {
		return errors.Wrap(err, "failed to delete subscription")
	}

	return nil
}
