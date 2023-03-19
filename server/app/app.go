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
