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
const HealthCheckPath = "/healthcheck"

type API struct {
	Logger      *log.Logger
	Root        *gin.Engine
	APIRoot     *gin.RouterGroup // 'api/v1'
	Users       *gin.RouterGroup // 'api/v1/users'
	User        *gin.RouterGroup // 'api/v1/users/{user_id:[A-Za-z0-9]+}'
	Nodes       *gin.RouterGroup // 'api/v1/nodes'
	Node        *gin.RouterGroup // 'api/v1/nodes/{node_id:[A-Za-z0-9]+}'
	Videos      *gin.RouterGroup // 'api/v1/videos'
	Texts       *gin.RouterGroup // 'api/v1/texts'
	Questions   *gin.RouterGroup // 'api/v1/questions'
	Preferences *gin.RouterGroup // 'api/v1/users/{user_id:[A-Za-z0-9]+}/preferences'
	Goals       *gin.RouterGroup // 'api/v1/goals/{user_id:[A-Za-z0-9]+}/nodes/{node_id:[A-Za-z0-9]+}'
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
	apiObj.initHealthCheck()
	apiObj.initUser()
	apiObj.initNode()
	apiObj.initGraph()
	apiObj.initVideo()
	apiObj.initText()
	apiObj.initQuestion()
	apiObj.initPreferences()
	apiObj.initGoal()

	apiObj.Root.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, "Page not found")
	})

	return nil
}

func (apiObj *API) initHealthCheck() {
	apiObj.Root.GET(HealthCheckPath, healthCheck)
}

func healthCheck(c *gin.Context) {
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	err = a.PerformDBCheck()
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, "OK")
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
