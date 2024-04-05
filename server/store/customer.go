package store

import (
	"database/sql"

	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

type CustomerStore interface {
	Save(Customer *model.Customer) (*model.Customer, error)
	Get(id string) (*model.Customer, error)
	Update(Customer *model.Customer) (*model.Customer, error)
	Delete(customer *model.Customer) (*model.Customer, error)

	SaveSubscription(subscription *model.Subscription) (*model.Subscription, error)
	GetSubscription(id string) (*model.Subscription, error)
	UpdateSubscription(subscription *model.Subscription) (*model.Subscription, error)
	DeleteSubscription(subscription *model.Subscription) (*model.Subscription, error)

	IsActiveCustomer(userID string) (bool, error)
}

// SQLCustomerStore is a struct to store Customer
type SQLCustomerStore struct {
	sqlStore           *SQLStore
	customerSelect     sq.SelectBuilder
	subscriptionSelect sq.SelectBuilder
}

func NewCustomerStore(db *SQLStore) CustomerStore {
	customerSelect := db.builder.
		Select(
			"c.customer_id",
			"c.email",
			"c.created_at",
			"c.deleted_at",
			"c.user_id",
		).
		From("customers c")

	subscriptionSelect := db.builder.
		Select(
			"s.subscription_id",
			"s.customer_id",
			"s.plan_id",
			"s.status",
			"s.created_at",
			"s.deleted_at",
			"s.triggered_by_event_at",
		).
		From("subscriptions s")

	return &SQLCustomerStore{
		sqlStore:           db,
		customerSelect:     customerSelect,
		subscriptionSelect: subscriptionSelect,
	}
}

// Save saves a Customer in the DB
func (es *SQLCustomerStore) Save(customer *model.Customer) (*model.Customer, error) {
	customer.BeforeSave()

	_, err := es.sqlStore.execBuilder(es.sqlStore.db, es.sqlStore.builder.
		Insert("customers").
		SetMap(map[string]interface{}{
			"customer_id": customer.CustomerID,
			"email":       customer.Email,
			"created_at":  customer.CreatedAt,
			"deleted_at":  customer.DeletedAt,
			"user_id":     customer.UserID,
		}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't save Customer with id:%s, email:%s and customerID:%s", customer.UserID, customer.Email, customer.CustomerID)
	}
	return customer, nil
}

// Get returns customer by id
func (es *SQLCustomerStore) Get(id string) (*model.Customer, error) {
	var customer model.Customer
	if err := es.sqlStore.getBuilder(es.sqlStore.db, &customer, es.customerSelect.Where(sq.Eq{"c.customer_id": id})); err != nil {
		return nil, errors.Wrapf(err, "can't get customer by id: %s", id)
	}
	return &customer, nil
}

// Update updates a Customer in the DB
func (es *SQLCustomerStore) Update(customer *model.Customer) (*model.Customer, error) {
	_, err := es.sqlStore.execBuilder(es.sqlStore.db, es.sqlStore.builder.
		Update("customers").
		SetMap(map[string]interface{}{
			"customer_id": customer.CustomerID,
			"email":       customer.Email,
			"created_at":  customer.CreatedAt,
			"deleted_at":  customer.DeletedAt,
			"user_id":     customer.UserID,
		}).
		Where(sq.Eq{"customer_id": customer.CustomerID}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't update Customer with id:%s, email:%s and customerID:%s", customer.UserID, customer.Email, customer.CustomerID)
	}
	return customer, nil
}

// Delete deletes a Customer from the DB
func (es *SQLCustomerStore) Delete(customer *model.Customer) (*model.Customer, error) {
	now := model.GetMillis()
	_, err := es.sqlStore.execBuilder(es.sqlStore.db, es.sqlStore.builder.
		Update("customers").
		SetMap(map[string]interface{}{
			"deleted_at": now,
		}).
		Where(sq.Eq{"customer_id": customer.CustomerID}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't delete Customer with id:%s, email:%s and customerID:%s", customer.UserID, customer.Email, customer.CustomerID)
	}
	customer.DeletedAt = now
	return customer, nil
}

func (es *SQLCustomerStore) SaveSubscription(subscription *model.Subscription) (*model.Subscription, error) {
	subscription.BeforeSave()
	_, err := es.sqlStore.execBuilder(es.sqlStore.db, sq.
		Insert("subscriptions").
		SetMap(map[string]interface{}{
			"subscription_id":       subscription.ID,
			"customer_id":           subscription.CustomerID,
			"plan_id":               subscription.PlanID,
			"status":                subscription.Status,
			"created_at":            subscription.CreatedAt,
			"deleted_at":            0,
			"triggered_by_event_at": subscription.TriggeredByEventAt,
		}),
	)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create subscription")
	}

	return subscription, nil
}

// Get returns subscription by id
func (es *SQLCustomerStore) GetSubscription(id string) (*model.Subscription, error) {
	var sub model.Subscription
	if err := es.sqlStore.getBuilder(es.sqlStore.db, &sub, es.subscriptionSelect.Where(sq.Eq{"s.subscription_id": id})); err != nil {
		return nil, errors.Wrapf(err, "can't get subscription by id: %s", id)
	}
	return &sub, nil
}

func (es *SQLCustomerStore) UpdateSubscription(subscription *model.Subscription) (*model.Subscription, error) {
	_, err := es.sqlStore.execBuilder(es.sqlStore.db, sq.
		Update("subscriptions").
		SetMap(map[string]interface{}{
			"status": subscription.Status,
		}).
		Where(sq.Eq{"subscription_id": subscription.ID}),
	)
	if err != nil {
		return nil, errors.Wrap(err, "failed to update subscription")
	}

	return subscription, nil
}

// Delete deletes a Customer subscription from the DB
func (es *SQLCustomerStore) DeleteSubscription(subscription *model.Subscription) (*model.Subscription, error) {
	now := model.GetMillis()
	_, err := es.sqlStore.execBuilder(es.sqlStore.db, es.sqlStore.builder.
		Update("subscriptions").
		SetMap(map[string]interface{}{
			"deleted_at": now,
			"status":     "deleted",
		}).
		Where(sq.Eq{"subscription_id": subscription.ID}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't delete Subscription with id:%s", subscription.ID)
	}
	subscription.DeletedAt = now
	return subscription, nil
}

func (es *SQLCustomerStore) IsActiveCustomer(userID string) (bool, error) {
	statuses := []string{}
	err := es.sqlStore.selectBuilder(es.sqlStore.db, &statuses, es.sqlStore.builder.
		Select("s.status").
		From("customers c").
		Join("subscriptions s ON s.customer_id = c.customer_id").
		Where(sq.And{
			sq.Eq{"c.user_id": userID},
			sq.Eq{"c.deleted_at": 0},
			sq.Eq{"s.deleted_at": 0},
		}))
	if err != nil && err != sql.ErrNoRows {
		return false, errors.Wrapf(err, "can't get statuses for user = %v", userID)
	}
	if err == sql.ErrNoRows {
		return false, nil
	}
	for _, status := range statuses {
		if status == "active" {
			return true, nil
		}
	}
	return false, nil
}
