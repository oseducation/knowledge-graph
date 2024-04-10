package store

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// PreferencesStore is an interface to crud preferences
type PreferencesStore interface {
	GetAll(userID string) ([]model.Preference, error)
	Get(userID, preferenceKey string) (string, error)
	Save(preferences []model.Preference) error
}

// SQLPreferencesStore is a struct to store preferences
type SQLPreferencesStore struct {
	sqlStore          *SQLStore
	preferencesSelect sq.SelectBuilder
}

// NewPreferencesStore creates a new store for preferences.
func NewPreferencesStore(db *SQLStore) PreferencesStore {
	preferencesSelect := db.builder.
		Select(
			"p.user_id",
			"p.key",
			"p.value",
		).
		From("preferences p")

	return &SQLPreferencesStore{
		sqlStore:          db,
		preferencesSelect: preferencesSelect,
	}
}

func (ps *SQLPreferencesStore) GetAll(userID string) ([]model.Preference, error) {
	preferences := []model.Preference{}
	if err := ps.sqlStore.selectBuilder(ps.sqlStore.db, &preferences, ps.preferencesSelect.
		Where(sq.Eq{"user_id": userID})); err != nil {
		return nil, errors.Wrapf(err, "can't get preferences for user: %s", userID)
	}
	return preferences, nil
}

func (ps *SQLPreferencesStore) Get(userID string, preferenceKey string) (string, error) {
	preference := model.Preference{}
	if err := ps.sqlStore.getBuilder(ps.sqlStore.db, &preference, ps.preferencesSelect.
		Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.Eq{"key": preferenceKey},
		})); err != nil {
		return "", errors.Wrapf(err, "can't get preferences for user: %s", userID)
	}
	return preference.Value, nil
}

func (ps *SQLPreferencesStore) Save(preferences []model.Preference) error {
	tx, err := ps.sqlStore.db.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer ps.sqlStore.finalizeTransaction(tx)

	for _, preference := range preferences {
		if err := ps.saveTx(tx, preference); err != nil {
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit preferences")
	}

	return nil
}

func (ps *SQLPreferencesStore) saveTx(tx *sqlx.Tx, preference model.Preference) error {
	if err := preference.IsValid(); err != nil {
		return err
	}
	query := ps.sqlStore.builder.
		Insert("preferences").
		SetMap(map[string]interface{}{
			"user_id": preference.UserID,
			"key":     preference.Key,
			"value":   preference.Value,
		}).
		SuffixExpr(sq.Expr(
			"ON CONFLICT (user_id, key) DO UPDATE SET Value = ?",
			preference.Value),
		)

	queryString, args, err := query.ToSql()
	if err != nil {
		return errors.Wrap(err, "failed to generate sqlquery")
	}

	if _, err = tx.Exec(queryString, args...); err != nil {
		return errors.Wrap(err, "failed to save Preference")
	}
	return nil
}
