package model

import (
	"github.com/pkg/errors"
)

const (
	TokenSize                 = 64
	MaxTokenExpireTime        = 1000 * 60 * 60 * 48 // 48 hour
	PasswordRecoverExpiryTime = 1000 * 60 * 60 * 24 // 24 hours

	TokenTypeVerifyEmail      = "verify_email"
	TokenTypePasswordRecovery = "password_recovery"
)

// Token describes secrets given to users
type Token struct {
	Token     string `json:"token" db:"token"`
	CreatedAt int64  `json:"created_at" db:"created_at"`
	Type      string `json:"type" db:"type"`
	Extra     string `json:"extra" db:"extra"`
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
