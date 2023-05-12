package api

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/app"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

const APIURLSuffix = "/api/v1"

type API struct {
	Logger  *log.Logger
	Root    *gin.Engine
	APIRoot *gin.RouterGroup // 'api/v1'
	Users   *gin.RouterGroup // 'api/v1/users'
	User    *gin.RouterGroup // 'api/v1/users/{user_id:[A-Za-z0-9]+}'
	Nodes   *gin.RouterGroup // 'api/v1/nodes'
	Node    *gin.RouterGroup // 'api/v1/nodes/{node_id:[A-Za-z0-9]+}'
}

// Init initializes api
func Init(router *gin.Engine, application *app.App) error {
	apiObj := API{}
	apiObj.Root = router
	apiObj.Root.Use(func(c *gin.Context) {
		c.Set("app", application)
		c.Set("api", apiObj)
		c.Next()
	})
	apiObj.APIRoot = router.Group(APIURLSuffix)

	apiObj.initUser()
	apiObj.initNode()
	apiObj.initGraph()

	apiObj.Root.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, "Page not found")
	})

	return nil
}

func responseFormat(c *gin.Context, respStatus int, data interface{}) {
	c.JSON(respStatus, data)
}

func getApp(c *gin.Context) (*app.App, error) {
	appInt, ok := c.Get("app")
	if !ok {
		return nil, errors.New("Missing application in the context")
	}
	a, ok := appInt.(*app.App)
	if !ok {
		return nil, errors.New("Wrong data type of the application in the context")
	}
	return a, nil
}

func getSession(c *gin.Context) (*model.Session, error) {
	sessionInt, ok := c.Get(sessionKey)
	if !ok {
		return nil, errors.New("Missing session in the context")
	}
	s, ok := sessionInt.(*model.Session)
	if !ok {
		return nil, errors.New("Wrong data type of the session in the context")
	}
	return s, nil
}
