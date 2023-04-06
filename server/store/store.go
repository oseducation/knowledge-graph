package store

import (
	"database/sql"

	"github.com/jinzhu/gorm"
	"github.com/jmoiron/sqlx"
	"github.com/oseducation/knowledge-graph/config"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"

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
	dbWrapper  *sqlx.DB
	userStore  *SQLUserStore
	tokenStore *SQLTokenStore
	config     *config.DBSettings
	logger     *log.Logger
}

// queryer is an interface describing a resource that can query.
//
// It exactly matches sqlx.Queryer, existing simply to constrain sqlx usage to this file.
type queryer interface {
	sqlx.Queryer
}

// builder is an interface describing a resource that can construct SQL and arguments.
//
// It exists to allow consuming any squirrel.*Builder type.
type builder interface {
	ToSql() (string, []interface{}, error)
}

// CreateStore creates an sqlite DB
func CreateStore(config *config.DBSettings, logger *log.Logger) Store {
	db, err := gorm.Open(config.DriverName, config.DataSource)
	if err != nil {
		panic("Failed to connect to database!")
	}

	db.AutoMigrate(&model.User{})
	db.AutoMigrate(&model.Token{})

	dbSQL, err := sql.Open(config.DriverName, config.DataSource)
	if err != nil {
		panic("Failed to connect to database!")
	}
	dbWrapper := sqlx.NewDb(dbSQL, config.DriverName)

	sqlStore := &SQLStore{
		db:         db,
		dbWrapper:  dbWrapper,
		userStore:  &SQLUserStore{db},
		tokenStore: &SQLTokenStore{db},
		config:     config,
		logger:     logger,
	}
	return sqlStore
}

func (sqlDB *SQLStore) EmptyAllTables() {
	if sqlDB.config.DriverName == "postgres" {
		sqlDB.db.Exec(`DO
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
		sqlDB.db.Exec("DELETE FROM users")
		sqlDB.db.Exec("DELETE FROM tokens")
	}
}

// get queries for a single row, building the sql, and writing the result into dest.
//
// Use this to simplify querying for a single row or column. Dest may be a pointer to a simple
// type, or a struct with fields to be populated from the returned columns.
func (sqlDB *SQLStore) getBuilder(q sqlx.Queryer, dest interface{}, b builder) error {
	sqlString, args, err := b.ToSql()
	if err != nil {
		return errors.Wrap(err, "failed to build sql")
	}

	sqlString = sqlDB.dbWrapper.Rebind(sqlString)

	return sqlx.Get(q, dest, sqlString, args...)
}

// selectBuilder queries for one or more rows, building the sql, and writing the result into dest.
//
// Use this to simplify querying for multiple rows (and possibly columns). Dest may be a slice of
// a simple, or a slice of a struct with fields to be populated from the returned columns.
func (sqlDB *SQLStore) selectBuilder(q sqlx.Queryer, dest interface{}, b builder) error {
	sqlString, args, err := b.ToSql()
	if err != nil {
		return errors.Wrap(err, "failed to build sql")
	}

	sqlString = sqlDB.dbWrapper.Rebind(sqlString)

	return sqlx.Select(q, dest, sqlString, args...)
}

// execer is an interface describing a resource that can execute write queries.
//
// It allows the use of *sqlx.Db and *sqlx.Tx.
type execer interface {
	Exec(query string, args ...interface{}) (sql.Result, error)
	DriverName() string
}

type queryExecer interface {
	queryer
	execer
}

// exec executes the given query using positional arguments, automatically rebinding for the db.
func (sqlDB *SQLStore) exec(e execer, sqlString string, args ...interface{}) (sql.Result, error) {
	sqlString = sqlDB.dbWrapper.Rebind(sqlString)
	return e.Exec(sqlString, args...)
}

// exec executes the given query, building the necessary sql.
func (sqlDB *SQLStore) execBuilder(e execer, b builder) (sql.Result, error) {
	sqlString, args, err := b.ToSql()
	if err != nil {
		return nil, errors.Wrap(err, "failed to build sql")
	}

	return sqlDB.exec(e, sqlString, args...)
}

// finalizeTransaction ensures a transaction is closed after use, rolling back if not already committed.
func (sqlDB *SQLStore) finalizeTransaction(tx *sqlx.Tx) {
	// Rollback returns sql.ErrTxDone if the transaction was already closed.
	if err := tx.Rollback(); err != nil && err != sql.ErrTxDone {
		sqlDB.logger.Error("Failed to rollback transaction", log.Err(err))
	}
}

// User returns an interface to manage users in the DB
func (sqlDB *SQLStore) User() UserStore {
	return sqlDB.userStore
}

// Token returns an interface to manage tokens in the DB
func (sqlDB *SQLStore) Token() TokenStore {
	return sqlDB.tokenStore
}
