package model

import (
	"encoding/json"
	"io"
	"strings"
	"time"

	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

// User type defines user
type User struct {
	ID                 string     `json:"id" gorm:"primary_key"`
	CreatedAt          time.Time  `json:"create_at,omitempty"`
	UpdatedAt          time.Time  `json:"update_at,omitempty"`
	DeletedAt          *time.Time `json:"delete_at" sql:"index"`
	Email              string     `json:"email" gorm:"unique;not null"`
	EmailVerified      bool       `json:"email_verified,omitempty"`
	Password           string     `json:"password,omitempty"`
	LastPasswordUpdate time.Time  `json:"last_password_update,omitempty"`
	Role               RoleType   `json:"role"`
}

// UserLogin type defines login info of the user.
type UserLogin struct {
	Email    string `form:"email" json:"email" binding:"required"`
	Password string `form:"password" json:"password" binding:"required"`
}

// UserFromJSON will decode the input and return a User
func UserFromJSON(data io.Reader) (*User, error) {
	var user *User
	if err := json.NewDecoder(data).Decode(&user); err != nil {
		return nil, errors.Wrap(err, "can't decode user")
	}
	return user, nil
}

// BeforeSave is a hook of the gorm, used to mutate user object before saving
func (u *User) BeforeSave(scope *gorm.Scope) error {
	u.Email = normalizeEmail(u.Email)
	if len(u.Password) > 0 {
		u.Password = hashPassword(u.Password)
	}
	return nil
}

// BeforeCreate is a hook of the gorm, used to populate user's column with values
func (u *User) BeforeCreate(scope *gorm.Scope) error {
	scope.SetColumn("ID", NewID())
	t := time.Now()
	err := scope.SetColumn("CreatedAt", t)
	if err != nil {
		return errors.Wrap(err, "can't set column CreatedAt")
	}
	err = scope.SetColumn("UpdatedAt", t)
	if err != nil {
		return errors.Wrap(err, "can't set column UpdateAt")
	}
	err = scope.SetColumn("LastPasswordUpdate", t)
	if err != nil {
		return errors.Wrap(err, "can't set column LastPasswordUpdate")
	}

	return nil
}

func (u *User) BeforeUpdate(scope *gorm.Scope) error {
	err := scope.SetColumn("UpdateAt", time.Now())
	if err != nil {
		return errors.Wrap(err, "can't set column UpdateAt")
	}
	return nil
}

func (u *User) Sanitize() {
	u.Password = ""
}

// ComparePassword compares the hash
func (u *User) ComparePassword(password string) bool {
	if len(password) == 0 || len(u.Password) == 0 {
		return false
	}

	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// HashPassword generates a hash using the bcrypt.GenerateFromPassword
func hashPassword(password string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		panic(err)
	}

	return string(hash)
}

// NormalizeEmail normalizes email
func normalizeEmail(email string) string {
	return strings.ToLower(email)
}
