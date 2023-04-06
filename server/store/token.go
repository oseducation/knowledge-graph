package store

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// SQLTokenStore struct to store tokens
type SQLTokenStore struct {
	sqlStore    *SQLStore
	tokenSelect sq.SelectBuilder
}

// TokenStore is an interface to crud tokens
type TokenStore interface {
	Save(token *model.Token) error
	Get(token string) (*model.Token, error)
	Delete(token string) error
}

// NewTokenStore creates a new store for tokens.
func NewTokenStore(db *SQLStore) TokenStore {
	tokenSelect := db.builder.
		Select(
			"t.token",
			"t.created_at",
			"t.type",
			"t.extra",
		).
		From("tokens t")

	return &SQLTokenStore{
		sqlStore:    db,
		tokenSelect: tokenSelect,
	}
}

// Save saves token in the DB
func (ts *SQLTokenStore) Save(token *model.Token) error {
	if err := token.IsValid(); err != nil {
		return err
	}
	_, err := ts.sqlStore.execBuilder(ts.sqlStore.db, sq.
		Insert("tokens").
		Columns("token", "created_at", "type", "extra").
		Values(token.Token, model.GetMillis(), token.Type, token.Extra))
	if err != nil {
		return errors.Wrapf(err, "can't save token - %s", token.Token)
	}
	return nil
}

// Get returns token
func (ts *SQLTokenStore) Get(token string) (*model.Token, error) {
	var tok model.Token
	if err := ts.sqlStore.getBuilder(ts.sqlStore.db, &tok, ts.tokenSelect.Where(sq.Eq{"t.token": token})); err != nil {
		return nil, errors.Wrapf(err, "can't get token: %s", token)
	}
	return &tok, nil
}

// Delete removes token
func (ts *SQLTokenStore) Delete(token string) error {
	if _, err := ts.sqlStore.execBuilder(ts.sqlStore.db, sq.
		Delete("tokens").
		Where(sq.Eq{"token": token})); err != nil {
		return errors.Wrapf(err, "can't delete token - %s", token)
	}
	return nil
}
