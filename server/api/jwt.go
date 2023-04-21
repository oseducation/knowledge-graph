package api

import (
	"net/http"
	"time"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/app"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

const (
	jwtSecret       = "some secret"
	identityKey     = "id"
	loggedInUserKey = "loginUser"
	HeaderToken     = "token"
)

func getJWTMiddleware(a *app.App) (*jwt.GinJWTMiddleware, error) {
	// the jwt middleware
	authMiddleware, err := jwt.New(&jwt.GinJWTMiddleware{
		Realm:       "test zone",
		Key:         []byte(jwtSecret),
		Timeout:     time.Hour,
		MaxRefresh:  time.Hour,
		IdentityKey: identityKey,
		PayloadFunc: func(data interface{}) jwt.MapClaims {
			if v, ok := data.(*model.User); ok {
				return jwt.MapClaims{
					identityKey: v.ID,
				}
			}
			return jwt.MapClaims{}
		},
		IdentityHandler: func(c *gin.Context) interface{} {
			claims := jwt.ExtractClaims(c)
			return claims[identityKey].(string)
		},
		Authenticator: func(c *gin.Context) (interface{}, error) {
			var loginValues model.UserLogin
			if err := c.ShouldBind(&loginValues); err != nil {
				return "", jwt.ErrMissingLoginValues
			}
			email := loginValues.Email
			password := loginValues.Password

			user, err := a.AuthenticateUser(email, password)
			if err != nil {
				return nil, jwt.ErrFailedAuthentication
			}
			c.Set(loggedInUserKey, user)
			return user, nil
		},
		Authorizator: func(data interface{}, c *gin.Context) bool {
			claims := jwt.ExtractClaims(c)
			return data.(string) == claims[identityKey].(string)
		},
		Unauthorized: func(c *gin.Context, code int, message string) {
			responseFormat(c, code, message)
		},
		LoginResponse: func(c *gin.Context, code int, token string, expire time.Time) {
			c.Header(HeaderToken, token)
			user, err := getLoggedUser(c)
			if err != nil {
				responseFormat(c, http.StatusInternalServerError, err.Error())
			}
			responseFormat(c, http.StatusOK, user)
		},
		LogoutResponse: func(c *gin.Context, code int) {
			responseFormat(c, http.StatusOK, "user logged out")
		},
		// TokenLookup is a string in the form of "<source>:<name>" that is used
		// to extract token from the request.
		// Optional. Default value "header:Authorization".
		// Possible values:
		// - "header:<name>"
		// - "query:<name>"
		// - "cookie:<name>"
		// - "param:<name>"
		TokenLookup: "header: Authorization",
		// TokenLookup: "query:token",
		// TokenLookup: "cookie:token",

		// TokenHeadName is a string in the header. Default value is "Bearer"
		TokenHeadName: "Bearer",

		// TimeFunc provides the current time. You can override it to use another time value. This is useful for testing or if your server uses a different time zone than your tokens.
		TimeFunc: time.Now,
	})

	return authMiddleware, err
}

func getLoggedUser(c *gin.Context) (*model.User, error) {
	userInt, ok := c.Get(loggedInUserKey)
	if !ok {
		return nil, errors.New("Missing user in the context")
	}
	user, ok := userInt.(*model.User)
	if !ok {
		return nil, errors.New("Wrong data type of the user in the context")
	}
	return user, nil
}
