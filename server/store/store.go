package store

import (
	"github.com/jinzhu/gorm"
	"github.com/oseducation/knowledge-graph/config"
	"github.com/oseducation/knowledge-graph/model"

	// An import of sqlite for gorm
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

// Store is an interface to communicate with the DB
type Store interface {
	EmptyAllTables()
	User() UserStore
	Token() TokenStore
}

// SQLStore struct represents a DB
type SQLStore struct {
	db         *gorm.DB
	userStore  *SQLUserStore
	tokenStore *SQLTokenStore
	config     *config.DBSettings
}

// CreateStore creates an sqlite DB
func CreateStore(config *config.DBSettings) Store {
	db, err := gorm.Open(config.DriverName, config.DataSource)

	if err != nil {
		panic("Failed to connect to database!")
	}

	db.AutoMigrate(&model.User{})
	db.AutoMigrate(&model.Token{})
	sqlStore := &SQLStore{
		db:         db,
		userStore:  &SQLUserStore{db},
		tokenStore: &SQLTokenStore{db},
		config:     config,
	}
	return sqlStore
}

func (sql *SQLStore) EmptyAllTables() {
	if sql.config.DriverName == "postgres" {
		sql.db.Exec(`DO
			$func$
			BEGIN
			   EXECUTE
			   (SELECT 'TRUNCATE TABLE ' || string_agg(oid::regclass::text, ', ') || ' CASCADE'
			    FROM   pg_class
			    WHERE  relkind = 'r'  -- only tables
			    AND    relnamespace = 'public'::regnamespace
			   );
			END
			$func$;`)
	} else {
		sql.db.Exec("DELETE FROM users")
		sql.db.Exec("DELETE FROM tokens")
	}
}

// User returns an interface to manage users in the DB
func (sql *SQLStore) User() UserStore {
	return sql.userStore
}

// Token returns an interface to manage tokens in the DB
func (sql *SQLStore) Token() TokenStore {
	return sql.tokenStore
}
