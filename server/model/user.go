package model

import (
	"encoding/json"
	"io"
	"time"
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
func UserFromJSON(data io.Reader) *User {
	var user *User
	json.NewDecoder(data).Decode(&user)
	return user
}

// IsAdmin returns whether user is admin or not.
func (u *User) IsAdmin() bool {
	return true
}
