package app

import (
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// AuthenticateUser authenticates user for login
func (a *App) AuthenticateUser(email, password string) (*model.User, error) {
	user, err := a.Store.User().GetByEmail(email)
	if err != nil {
		return nil, errors.Wrap(err, "can't authenticate user")
	}
	if !user.ComparePassword(password) {
		return nil, errors.New("Wrong Password")
	}
	user.Sanitize()
	return user, nil
}

// CreateUserFromSignUp creates user on sign up
func (a *App) CreateUserFromSignUp(user *model.User) (*model.User, error) {
	user.Role = model.UserRole
	user.EmailVerified = false
	ruser, err := a.Store.User().Save(user)
	if err != nil {
		return nil, errors.Wrapf(err, "useremail = %s", user.Email)
	}
	if err := a.sendWelcomeEmail(ruser.ID, ruser.Email, ruser.EmailVerified, a.GetSiteURL()); err != nil {
		a.Log.Error("Failed to send welcome email on create user from signup", log.Err(err))
	}
	return user, nil
}

// GetUsers gets users, filters usernames with 'term'
func (a *App) GetUsers(options *model.UserGetOptions) ([]*model.User, error) {
	users, err := a.Store.User().GetUsers(options)
	if err != nil {
		return nil, errors.Wrapf(err, "options = %v", options)
	}
	return a.sanitizeUsers(users), nil
}

// GetUser gets user with id
func (a *App) GetUser(userID string) (*model.User, error) {
	user, err := a.Store.User().Get(userID)
	if err != nil {
		return nil, errors.Wrapf(err, "can't get userID = %v", userID)
	}
	return user, nil
}

// CreateUser creates new user
func (a *App) CreateUser(user *model.User) (*model.User, error) {
	user.EmailVerified = false
	ruser, err := a.Store.User().Save(user)
	if err != nil {
		return nil, errors.Wrapf(err, "userID = %s", user.ID)
	}
	if err := a.sendWelcomeEmail(ruser.ID, ruser.Email, ruser.EmailVerified, a.GetSiteURL()); err != nil {
		a.Log.Error("Failed to send welcome email on create user", log.Err(err))
	}
	return ruser, nil
}

// UpdateUser updates user
func (a *App) UpdateUser(user *model.User) error {
	if err := a.Store.User().Update(user); err != nil {
		return errors.Wrapf(err, "user = %s", user.ID)
	}
	return nil
}

// DeleteUser deletes user
func (a *App) DeleteUser(user *model.User) error {
	if err := a.Store.User().Delete(user); err != nil {
		return errors.Wrapf(err, "user = %s", user.ID)
	}
	return nil
}

func (a *App) sanitizeUsers(users []*model.User) []*model.User {
	for _, u := range users {
		u.Sanitize()
	}
	return users
}
