package model

// User type defines user
type User struct {
	ID    string
	Email string
}

// UserLogin type defines login info of the user.
type UserLogin struct {
	Email    string `form:"email" json:"email" binding:"required"`
	Password string `form:"password" json:"password" binding:"required"`
}

// IsAdmin returns whether user is admin or not.
func (u *User) IsAdmin() bool {
	return true
}
