package store

import (
	"context"
	"database/sql"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"

	//nolint: blank-imports
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"

	"github.com/oseducation/knowledge-graph/config"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/pkg/errors"
)

const DBPingAttempts = 10
const DBPingTimeoutSecs = 10

// Store is an interface to communicate with the DB
type Store interface {
	Nuke() error
	EmptyAllTables()
	User() UserStore
	Token() TokenStore
	Node() NodeStore
	Video() VideoStore
	Text() TextStore
	Question() QuestionStore
	Graph() GraphStore
	Session() SessionStore
	System() SystemStore
	Preferences() PreferencesStore
	UserCode() UserCodeStore
	Goal() GoalStore
	Post() PostStore
	UserInteraction() UserInteractionStore
	Experiments() ExperimentsStore
	Customer() CustomerStore
}

// SQLStore struct represents a DB
type SQLStore struct {
	db      *sqlx.DB
	builder sq.StatementBuilderType

	userStore            UserStore
	tokenStore           TokenStore
	nodeStore            NodeStore
	videoStore           VideoStore
	textStore            TextStore
	questionStore        QuestionStore
	graphStore           GraphStore
	sessionStore         SessionStore
	systemStore          SystemStore
	preferencesStore     PreferencesStore
	userCodeStore        UserCodeStore
	goalStore            GoalStore
	postStore            PostStore
	userInteractionStore UserInteractionStore
	experimentsStore     ExperimentsStore
	customerStore        CustomerStore
	config               *config.DBSettings
	logger               *log.Logger
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

	// Test connection
	err = dbSQL.Ping()
	if err != nil {
		logger.Fatal("Pinging database", log.Err(err))
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
	sqlStore.videoStore = NewVideoStore(sqlStore)
	sqlStore.textStore = NewTextStore(sqlStore)
	sqlStore.questionStore = NewQuestionStore(sqlStore)
	sqlStore.graphStore = NewGraphStore(sqlStore)
	sqlStore.sessionStore = NewSessionStore(sqlStore)
	sqlStore.systemStore = NewSystemStore(sqlStore)
	sqlStore.preferencesStore = NewPreferencesStore(sqlStore)
	sqlStore.userCodeStore = NewUserCodeStore(sqlStore)
	sqlStore.goalStore = NewGoalStore(sqlStore)
	sqlStore.postStore = NewPostStore(sqlStore)
	sqlStore.userInteractionStore = NewUserInteractionStore(sqlStore)
	sqlStore.experimentsStore = NewExperimentsStore(sqlStore)
	sqlStore.customerStore = NewCustomerStore(sqlStore)
	if err := sqlStore.RunMigrations(); err != nil {
		logger.Fatal("can't run migrations", log.Err(err))
	}
	return sqlStore
}

// NukeDB removes all data.
func (sqlDB *SQLStore) Nuke() error {
	tx, err := sqlDB.db.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer sqlDB.finalizeTransaction(tx)

	if _, err := tx.Exec("DROP TABLE IF EXISTS system"); err != nil {
		return errors.Wrap(err, "could not delete system")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS users"); err != nil {
		return errors.Wrap(err, "could not users")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS tokens"); err != nil {
		return errors.Wrap(err, "could not tokens")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS nodes"); err != nil {
		return errors.Wrap(err, "could not nodes")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS edges"); err != nil {
		return errors.Wrap(err, "could not edges")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS videos"); err != nil {
		return errors.Wrap(err, "could not videos")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS texts"); err != nil {
		return errors.Wrap(err, "could not texts")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS sessions"); err != nil {
		return errors.Wrap(err, "could not sessions")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS user_nodes"); err != nil {
		return errors.Wrap(err, "could not user_nodes")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS user_goals"); err != nil {
		return errors.Wrap(err, "could not user_goals")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS posts"); err != nil {
		return errors.Wrap(err, "could not posts")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS user_interactions"); err != nil {
		return errors.Wrap(err, "could not user_interactions")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS experiment_users"); err != nil {
		return errors.Wrap(err, "could not experiment_users")
	}

	if _, err := tx.Exec("DROP TABLE IF EXISTS customer"); err != nil {
		return errors.Wrap(err, "could not customer")
	}

	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit")
	}

	return sqlDB.RunMigrations()
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
		if _, err := sqlDB.db.Exec("DELETE FROM sessions"); err != nil {
			sqlDB.logger.Fatal("can't delete from sessions", log.Err(err))
		}
		if _, err := sqlDB.db.Exec("DELETE FROM nodes"); err != nil {
			sqlDB.logger.Fatal("can't delete from nodes", log.Err(err))
		}
		if _, err := sqlDB.db.Exec("DELETE FROM user_nodes"); err != nil {
			sqlDB.logger.Fatal("can't delete from user_nodes", log.Err(err))
		}
		if _, err := sqlDB.db.Exec("DELETE FROM texts"); err != nil {
			sqlDB.logger.Fatal("can't delete from texts", log.Err(err))
		}
		if _, err := sqlDB.db.Exec("DELETE FROM videos"); err != nil {
			sqlDB.logger.Fatal("can't delete from videos", log.Err(err))
		}
		if _, err := sqlDB.db.Exec("DELETE FROM user_goals"); err != nil {
			sqlDB.logger.Fatal("can't delete from user_goals", log.Err(err))
		}
		if _, err := sqlDB.db.Exec("DELETE FROM posts"); err != nil {
			sqlDB.logger.Fatal("can't delete from posts", log.Err(err))
		}
		if _, err := sqlDB.db.Exec("DELETE FROM user_interactions"); err != nil {
			sqlDB.logger.Fatal("can't delete from user_interactions", log.Err(err))
		}
		if _, err := sqlDB.db.Exec("DELETE FROM experiment_users"); err != nil {
			sqlDB.logger.Fatal("can't delete from experiment_users", log.Err(err))
		}
		if _, err := sqlDB.db.Exec("DELETE FROM customer"); err != nil {
			sqlDB.logger.Fatal("can't delete from customer", log.Err(err))
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

// Video returns an interface to manage video in the DB
func (sqlDB *SQLStore) Video() VideoStore {
	return sqlDB.videoStore
}

// Text returns an interface to manage text in the DB
func (sqlDB *SQLStore) Text() TextStore {
	return sqlDB.textStore
}

// Question returns an interface to manage question in the DB
func (sqlDB *SQLStore) Question() QuestionStore {
	return sqlDB.questionStore
}

// Graph returns an interface to manage graph edges in the DB
func (sqlDB *SQLStore) Graph() GraphStore {
	return sqlDB.graphStore
}

// Session returns an interface to manage sessions in the DB
func (sqlDB *SQLStore) Session() SessionStore {
	return sqlDB.sessionStore
}

// System returns an interface to get system information from the DB
func (sqlDB *SQLStore) System() SystemStore {
	return sqlDB.systemStore
}

// Preferences returns an interface to manage preferences in the DB
func (sqlDB *SQLStore) Preferences() PreferencesStore {
	return sqlDB.preferencesStore
}

// UserCode returns an interface to manage user codes in the DB
func (sqlDB *SQLStore) UserCode() UserCodeStore {
	return sqlDB.userCodeStore
}

// Goal returns an interface to manage user goals in the DB
func (sqlDB *SQLStore) Goal() GoalStore {
	return sqlDB.goalStore
}

// Post returns an interface to manage user posts in the DB
func (sqlDB *SQLStore) Post() PostStore {
	return sqlDB.postStore
}

// UserInteraction returns an interface to manage user interactions in the DB
func (sqlDB *SQLStore) UserInteraction() UserInteractionStore {
	return sqlDB.userInteractionStore
}

// Experiments returns an interface to manage experiment users in the DB
func (sqlDB *SQLStore) Experiments() ExperimentsStore {
	return sqlDB.experimentsStore
}

// Customer returns an interface to manage cutomer in the DB
func (sqlDB *SQLStore) Customer() CustomerStore {
	return sqlDB.customerStore
}
