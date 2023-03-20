package store

import (
	"github.com/jinzhu/gorm"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// SQLTokenStore struct to store tokens
type SQLTokenStore struct {
	db *gorm.DB
}

// TokenStore is an interface to crud tokens
type TokenStore interface {
	Save(token *model.Token) error
	Get(token string) (*model.Token, error)
	Delete(token string) error
}

// Save saves token in the DB
func (ts *SQLTokenStore) Save(token *model.Token) error {
	if err := token.IsValid(); err != nil {
		return err
	}
	if err := ts.db.Create(token).Error; err != nil {
		return errors.Wrapf(err, "can't save token - %s", token.Token)
	}
	return nil
}

// Get returns token
func (ts *SQLTokenStore) Get(token string) (*model.Token, error) {
	var tok model.Token
	if err := ts.db.First(&tok, "Token = ?", token).Error; err != nil {
		return nil, errors.Wrapf(err, "can't get token: %s", token)
	}
	return &tok, nil
}

// Delete removes token
func (ts *SQLTokenStore) Delete(token string) error {
	if err := ts.db.Where("Token = ?", token).Delete(&model.Token{}).Error; err != nil {
		return errors.Wrapf(err, "can't delete token - %s", token)
	}
	return nil
}
