package app

import "github.com/oseducation/knowledge-graph/model"

// App type defines application global state
type App struct {
}

// NewApp creates new App
func NewApp() (*App, error) {
	return &App{}, nil
}

// AuthenticateUser authenticates user for login
func (a *App) AuthenticateUser(username, password string) (*model.User, error) {
	return nil, nil
}
