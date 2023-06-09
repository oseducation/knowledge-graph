package store

import (
	"database/sql"

	sq "github.com/Masterminds/squirrel"
	"github.com/pkg/errors"
)

type SystemStore interface {
	GetCurrentVersion() (string, error)
}

type SQLSystemStore struct {
	sqlStore *SQLStore
}

func NewSystemStore(db *SQLStore) SystemStore {
	return &SQLSystemStore{
		sqlStore: db,
	}
}

func (ss *SQLSystemStore) GetCurrentVersion() (string, error) {
	currentVersionStr, err := ss.sqlStore.getSystemValue(ss.sqlStore.db, systemDatabaseVersionKey)
	return currentVersionStr, err
}

// getSystemValue queries the System table for the given key
func (sqlDB *SQLStore) getSystemValue(q queryer, key string) (string, error) {
	var value string

	err := sqlDB.getBuilder(q, &value,
		sqlDB.builder.Select("s_value").
			From("system").
			Where(sq.Eq{"s_key": key}),
	)
	if err == sql.ErrNoRows {
		return "", nil
	} else if err != nil {
		return "", errors.Wrapf(err, "failed to query system key %s", key)
	}

	return value, nil
}

// setSystemValue updates the System table for the given key.
func (sqlDB *SQLStore) setSystemValue(e queryExecer, key, value string) error {
	result, err := sqlDB.execBuilder(e,
		sqlDB.builder.Update("system").
			Set("s_value", value).
			Where(sq.Eq{"s_key": key}),
	)
	if err != nil {
		return errors.Wrapf(err, "failed to update system key %s", key)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return nil
	}

	_, err = sqlDB.execBuilder(e,
		sqlDB.builder.Insert("system").
			Columns("s_key", "s_value").
			Values(key, value),
	)
	if err != nil {
		return errors.Wrapf(err, "failed to insert system key %s", key)
	}

	return nil
}
