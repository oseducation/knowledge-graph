package model

import (
	"encoding/json"
	"io"
	"net/mail"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

const (
	UserEmailMaxLength    = 128
	UserNameMaxLength     = 64
	UserNameMinLength     = 1
	UserPasswordMaxLength = 72
	PasswordMinLength     = 6
	UserFirstNameMaxRunes = 64
	UserLastNameMaxRunes  = 64
)

var validUsernameChars = regexp.MustCompile(`^[a-z0-9\.\-_]+$`)

// User type defines user
type User struct {
	ID                 string   `json:"id" db:"id"`
	CreatedAt          int64    `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt          int64    `json:"updated_at,omitempty" db:"updated_at"`
	DeletedAt          int64    `json:"deleted_at" db:"deleted_at"`
	Username           string   `json:"username" db:"username"`
	FirstName          string   `json:"first_name,omitempty" db:"first_name"`
	LastName           string   `json:"last_name,omitempty" db:"last_name"`
	Email              string   `json:"email" db:"email"`
	EmailVerified      bool     `json:"email_verified,omitempty" db:"email_verified"`
	Password           string   `json:"password,omitempty" db:"password"`
	LastPasswordUpdate int64    `json:"last_password_update,omitempty" db:"last_password_update"`
	Role               RoleType `json:"role" db:"role"`
	Lang               string   `json:"lang" db:"lang"`
}

// UserLogin type defines login info of the user.
type UserLogin struct {
	Email    string `form:"email" json:"email" binding:"required"`
	Password string `form:"password" json:"password" binding:"required"`
}

type UserWithNodeCount struct {
	User
	FinishedNodeCount   int64 `json:"finished_node_count" db:"finished_node_count"`
	InProgressNodeCount int64 `json:"in_progress_node_count" db:"in_progress_node_count"`
}

// UserFromJSON will decode the input and return a User
func UserFromJSON(data io.Reader) (*User, error) {
	var user *User
	if err := json.NewDecoder(data).Decode(&user); err != nil {
		return nil, errors.Wrap(err, "can't decode user")
	}
	return user, nil
}

// UserLoginFromJSON will decode the input and return a User
func UserLoginFromJSON(data io.Reader) (*UserLogin, error) {
	var userLogin *UserLogin
	if err := json.NewDecoder(data).Decode(&userLogin); err != nil {
		return nil, errors.Wrap(err, "can't decode user")
	}
	return userLogin, nil
}

// BeforeSave should be called before storing the user
func (u *User) BeforeSave() {
	u.ID = NewID()
	if u.CreatedAt == 0 {
		u.CreatedAt = GetMillis()
	}
	u.UpdatedAt = u.CreatedAt
	u.LastPasswordUpdate = u.CreatedAt

	u.Username = SanitizeUnicode(u.Username)
	u.FirstName = SanitizeUnicode(u.FirstName)
	u.LastName = SanitizeUnicode(u.LastName)

	u.Username = normalizeUsername(u.Username)
	u.Email = normalizeEmail(u.Email)

	if len(u.Password) > 0 {
		u.Password = hashPassword(u.Password)
	}
}

// BeforeUpdate should be run before updating the user in the db.
func (u *User) BeforeUpdate() {
	u.Username = SanitizeUnicode(u.Username)
	u.FirstName = SanitizeUnicode(u.FirstName)
	u.LastName = SanitizeUnicode(u.LastName)

	u.Username = normalizeUsername(u.Username)
	u.Email = normalizeEmail(u.Email)
	u.UpdatedAt = GetMillis()
}

// IsValid validates the user and returns an error if it isn't configured correctly.
func (u *User) IsValid() error {
	if !IsValidID(u.ID) {
		return invalidUserError("", "id", u.ID)
	}

	if u.CreatedAt == 0 {
		return invalidUserError(u.ID, "create_at", u.CreatedAt)
	}

	if u.UpdatedAt == 0 {
		return invalidUserError(u.ID, "updated_at", u.UpdatedAt)
	}

	if !IsValidUsername(u.Username) {
		return invalidUserError(u.ID, "username", u.Username)
	}

	if len(u.Email) > UserEmailMaxLength || u.Email == "" || !IsValidEmail(u.Email) {
		return invalidUserError(u.ID, "email", u.Email)
	}

	if utf8.RuneCountInString(u.FirstName) > UserFirstNameMaxRunes {
		return invalidUserError(u.ID, "first_name", u.FirstName)
	}

	if utf8.RuneCountInString(u.LastName) > UserLastNameMaxRunes {
		return invalidUserError(u.ID, "last_name", u.LastName)
	}

	if len(u.Password) > UserPasswordMaxLength {
		return invalidUserError(u.ID, "password_limit", "")
	}

	if len(u.Password) < PasswordMinLength {
		return invalidUserError(u.ID, "password", "")
	}

	if u.Lang != LanguageEnglish && u.Lang != LanguageGeorgian {
		return invalidUserError(u.ID, "lang", u.Lang)
	}

	if u.FirstName == "" {
		return invalidUserError(u.ID, "first_name", u.FirstName)
	}

	if u.LastName == "" {
		return invalidUserError(u.ID, "last_name", u.LastName)
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

func (u *User) UpdatePassword(newPassword string) {
	u.Password = hashPassword(newPassword)
	u.LastPasswordUpdate = GetMillis()
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

func normalizeUsername(username string) string {
	return strings.ToLower(username)
}

func IsValidUsername(s string) bool {
	if len(s) < UserNameMinLength || len(s) > UserNameMaxLength {
		return false
	}

	if !validUsernameChars.MatchString(s) {
		return false
	}

	return true
}

func IsValidEmail(email string) bool {
	if strings.ToLower(email) != email {
		return false
	}

	if addr, err := mail.ParseAddress(email); err != nil {
		return false
	} else if addr.Name != "" {
		// mail.ParseAddress accepts input of the form "Billy Bob <billy@example.com>" which we don't allow
		return false
	}

	return true
}

func invalidUserError(userID, fieldName string, fieldValue any) error {
	return errors.Errorf("invalid user error. userID=%s %s=%v", userID, fieldName, fieldValue)
}

type PerformerUser struct {
	ID            string `json:"id" db:"id"`
	Username      string `json:"username" db:"username"`
	FirstName     string `json:"first_name,omitempty" db:"first_name"`
	LastName      string `json:"last_name,omitempty" db:"last_name"`
	FinishedCount int    `json:"finished_count" db:"finished_count"`
}
