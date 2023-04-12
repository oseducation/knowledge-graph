package api

import (
	"log"
	"net/http"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/app"
	"github.com/pkg/errors"
)

const APIURLSuffix = "/api/v1"

type API struct {
	Logger        *log.Logger
	Root          *gin.Engine
	APIRoot       *gin.RouterGroup // 'api/v1'
	Users         *gin.RouterGroup // 'api/v1/users'
	User          *gin.RouterGroup // 'api/v1/users/{user_id:[A-Za-z0-9]+}'
	Nodes         *gin.RouterGroup // 'api/v1/nodes'
	jwtMiddleware *jwt.GinJWTMiddleware
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

	mw, err := getJWTMiddleware(application)
	if err != nil {
		return errors.Wrap(err, "can't create jwt middleware")
	}
	apiObj.jwtMiddleware = mw

	apiObj.initUser()
	apiObj.initNode()
	apiObj.initGraph()

	apiObj.Root.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, "Page not found")
	})

	return nil
}

func responseFormat(c *gin.Context, respStatus int, respMessage string, data interface{}) {
	c.JSON(respStatus, gin.H{
		"msg":  respMessage,
		"data": data,
	})
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
