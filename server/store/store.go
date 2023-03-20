package store

import (
	"github.com/jinzhu/gorm"
	"github.com/oseducation/knowledge-graph/model"

	// An import of sqlite for gorm
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

// Store is an interface to communicate with the DB
type Store interface {
	User() UserStore
	Token() TokenStore
}

// SQLStore struct represents a DB
type SQLStore struct {
	db         *gorm.DB
	userStore  *SQLUserStore
	tokenStore *SQLTokenStore
}

// CreateStore creates an sqlite DB
func CreateStore() Store {
	db, err := gorm.Open("sqlite3", "sqlite.db")

	if err != nil {
		panic("Failed to connect to database!")
	}

	db.AutoMigrate(&model.User{})
	sqlStore := &SQLStore{
		db:         db,
		userStore:  &SQLUserStore{db},
		tokenStore: &SQLTokenStore{db},
	}
	return sqlStore
}

// User returns an interface to manage users in the DB
func (sql *SQLStore) User() UserStore {
	return sql.userStore
}

// Token returns an interface to manage tokens in the DB
func (sql *SQLStore) Token() TokenStore {
	return sql.tokenStore
}
