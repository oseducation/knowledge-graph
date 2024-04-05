package store

import (
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
	UpdateSubscription(subscription *model.Subscription) (*model.Subscription, error)
	DeleteSubscription(subscription *model.Subscription) (*model.Subscription, error)
}

// SQLCustomerStore is a struct to store Customer
type SQLCustomerStore struct {
	sqlStore       *SQLStore
	customerSelect sq.SelectBuilder
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

	return &SQLCustomerStore{
		sqlStore:       db,
		customerSelect: customerSelect,
	}
}

// Save saves a Customer in the DB
func (es *SQLCustomerStore) Save(customer *model.Customer) (*model.Customer, error) {
	customer.BeforeSave()
	if err := customer.IsValid(); err != nil {
		return nil, err
	}

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
	if err := customer.IsValid(); err != nil {
		return nil, err
	}
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

func (es *SQLCustomerStore) UpdateSubscription(subscription *model.Subscription) (*model.Subscription, error) {
	_, err := es.sqlStore.execBuilder(es.sqlStore.db, sq.
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

// Delete deletes a Customer subscription from the DB
func (es *SQLCustomerStore) DeleteSubscription(subscription *model.Subscription) (*model.Subscription, error) {
	now := model.GetMillis()
	_, err := es.sqlStore.execBuilder(es.sqlStore.db, es.sqlStore.builder.
		Update("subscriptions").
		SetMap(map[string]interface{}{
			"deleted_at": now,
		}).
		Where(sq.Eq{"customer_id": subscription.ID}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't delete Subscription with id:%s", subscription.ID)
	}
	subscription.DeletedAt = now
	return subscription, nil
}
