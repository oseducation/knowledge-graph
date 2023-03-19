package app

import (
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
)

// App type defines application global state
type App struct {
	Log *log.Logger
}

// NewApp creates new App
func NewApp(logger *log.Logger) (*App, error) {
	return &App{logger}, nil
}

// AuthenticateUser authenticates user for login
func (a *App) AuthenticateUser(username, password string) (*model.User, error) {
	return &model.User{Email: "bla", ID: "bla"}, nil
}

// CreateUserFromSignUp creates user on sign up
func (a *App) CreateUserFromSignUp(user *model.User) (*model.User, error) {
	return user, nil
}

// GetUsers gets users, filters usernames with 'term'
func (a *App) GetUsers(options *model.UserGetOptions) ([]*model.User, error) {
	return nil, nil
}

// UpdateUser updates user
func (a *App) UpdateUser(user *model.User) error {
	return nil
}

// DeleteUser deletes user
func (a *App) DeleteUser(userID string) error {
	return nil
}
