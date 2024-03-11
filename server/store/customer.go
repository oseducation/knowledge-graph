package store

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

type CustomerStore interface {
	Save(Customer *model.Customer) (*model.Customer, error)
	Update(Customer *model.Customer) (*model.Customer, error)
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
		).
		From("customers c")

	return &SQLCustomerStore{
		sqlStore:       db,
		customerSelect: customerSelect,
	}
}

// Save saves a Customer in the DB
func (es *SQLCustomerStore) Save(Customer *model.Customer) (*model.Customer, error) {
	// if Customer.ID != "" {
	// 	return nil, errors.New("invalid input")
	// }
	// Customer.BeforeSave()
	// if err := Customer.IsValid(); err != nil {
	// 	return nil, err
	// }

	_, err := es.sqlStore.execBuilder(es.sqlStore.db, es.sqlStore.builder.
		Insert("customers").
		SetMap(map[string]interface{}{
			"customer_id": Customer.CustomerID,
			"email":       Customer.Email,
			"created_at":  Customer.CreatedAt,
		}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't save Customer with email:%s", Customer.Email)
	}
	return Customer, nil
}

// Update updates a Customer in the DB
func (es *SQLCustomerStore) Update(Customer *model.Customer) (*model.Customer, error) {
	_, err := es.sqlStore.execBuilder(es.sqlStore.db, es.sqlStore.builder.
		Update("customers").
		SetMap(map[string]interface{}{
			"customer_id": Customer.CustomerID,
			"email":       Customer.Email,
			"created_at":  Customer.CreatedAt,
		}).
		Where(sq.Eq{"customer_id": Customer.CustomerID}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't update Customer with email:%s", Customer.Email)
	}
	return Customer, nil
}
