package store

import (
	"context"
	"database/sql"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"

	//nolint: blank-imports
	_ "github.com/mattn/go-sqlite3"
	"github.com/oseducation/knowledge-graph/config"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/pkg/errors"
)

const DBPingAttempts = 10
const DBPingTimeoutSecs = 10

// Store is an interface to communicate with the DB
type Store interface {
	EmptyAllTables()
	User() UserStore
	Token() TokenStore
	Node() NodeStore
	Graph() GraphStore
}

// SQLStore struct represents a DB
type SQLStore struct {
	db      *sqlx.DB
	builder sq.StatementBuilderType

	userStore  UserStore
	tokenStore TokenStore
	nodeStore  NodeStore
	graphStore GraphStore
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
	dbSQL, err := sql.Open(config.DriverName, config.DataSource)
	if err != nil {
		panic("Failed to connect to database!")
	}

	for i := 0; i < DBPingAttempts; i++ {
		logger.Info("Pinging SQL", log.String("database", config.DataSource))
		ctx, cancel := context.WithTimeout(context.Background(), DBPingTimeoutSecs*time.Second)
		defer cancel()
		err = dbSQL.PingContext(ctx)
		if err == nil {
			break
		}
		if i == DBPingAttempts-1 {
			logger.Fatal("Failed to ping DB, server will exit.", log.Err(err))
		} else {
			logger.Error("Failed to ping DB", log.Err(err), log.Int("retrying in seconds", DBPingTimeoutSecs))
			time.Sleep(DBPingTimeoutSecs * time.Second)
		}
	}

	dbWrapper := sqlx.NewDb(dbSQL, config.DriverName)
	builder := sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

	sqlStore := &SQLStore{
		db:      dbWrapper,
		builder: builder,
		config:  config,
		logger:  logger,
	}

	sqlStore.userStore = NewUserStore(sqlStore)
	sqlStore.tokenStore = NewTokenStore(sqlStore)
	sqlStore.nodeStore = NewNodeStore(sqlStore)
	sqlStore.graphStore = NewGraphStore(sqlStore)
	if err := sqlStore.RunMigrations(); err != nil {
		logger.Fatal("can't run migrations", log.Err(err))
	}
	return sqlStore
}

func (sqlDB *SQLStore) EmptyAllTables() {
	if sqlDB.config.DriverName == "postgres" {
		if _, err := sqlDB.db.Exec(`DO
			$func$
			BEGIN
			   EXECUTE
			   (SELECT 'TRUNCATE TABLE ' || string_agg(oid::regclass::text, ', ') || ' CASCADE'
			    FROM   pg_class
			    WHERE  relkind = 'r'  -- only tables
			    AND    relnamespace = 'public'::regnamespace
			   );
			END
			$func$;`); err != nil {
			sqlDB.logger.Fatal("can't TRUNCATE TABLE for postgres", log.Err(err))
		}
	} else {
		if _, err := sqlDB.db.Exec("DELETE FROM users"); err != nil {
			sqlDB.logger.Fatal("can't delete from users", log.Err(err))
		}
		if _, err := sqlDB.db.Exec("DELETE FROM tokens"); err != nil {
			sqlDB.logger.Fatal("can't delete from tokens", log.Err(err))
		}
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

	sqlString = sqlDB.db.Rebind(sqlString)

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

	sqlString = sqlDB.db.Rebind(sqlString)

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
	sqlString = sqlDB.db.Rebind(sqlString)
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

// Node returns an interface to manage nodes in the DB
func (sqlDB *SQLStore) Node() NodeStore {
	return sqlDB.nodeStore
}

// Graph returns an interface to manage graph edges in the DB
func (sqlDB *SQLStore) Graph() GraphStore {
	return sqlDB.graphStore
}
