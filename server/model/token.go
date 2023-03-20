package model

import (
	"time"

	"github.com/pkg/errors"
)

const (
	TokenSize          = 64
	MaxTokenExpireTime = 1000 * 60 * 60 * 48 // 48 hour

	TokenTypeVerifyEmail = "verify_email"
)

// Token describes secrets given to users
type Token struct {
	Token    string
	CreateAt time.Time
	Type     string
	Extra    string
}

// NewToken creates new token
func NewToken(tokentype, extra string) *Token {
	return &Token{
		Token: NewRandomString(TokenSize),
		Type:  tokentype,
		Extra: extra,
	}
}

// IsValid check validity of the token
func (t *Token) IsValid() error {
	if len(t.Token) != TokenSize {
		return errors.New("invalid token size")
	}
	return nil
}
