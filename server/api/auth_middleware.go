package api

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const AuthHeader = "Authorization"
const HeaderBearer = "Bearer"

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := parseAuthTokenFromRequest(c.Request)
		if token == "" {
			responseFormat(c, http.StatusUnauthorized, "missing token")
			return
		}

		a, err := getApp(c)
		if err != nil {
			responseFormat(c, http.StatusInternalServerError, err.Error())
			c.Abort()
			return
		}

		session, err := a.GetSession(token)
		if err != nil {
			responseFormat(c, http.StatusUnauthorized, err.Error())
			c.Abort()
			return
		}

		c.Set(sessionKey, session)
		c.Next()
	}
}

func requireNodePermissions() gin.HandlerFunc {
	return func(c *gin.Context) {
		session, err := getSession(c)
		if err != nil {
			responseFormat(c, http.StatusUnauthorized, err.Error())
			c.Abort()
			return
		}
		if !session.CanManageNodes() {
			responseFormat(c, http.StatusForbidden, "No permission for this action")
			c.Abort()
			return
		}

		c.Next()
	}
}

func requireUserPermissions() gin.HandlerFunc {
	return func(c *gin.Context) {
		session, err := getSession(c)
		if err != nil {
			responseFormat(c, http.StatusUnauthorized, err.Error())
			c.Abort()
			return
		}
		if !session.CanManageUsers() {
			responseFormat(c, http.StatusForbidden, "No permission for this action")
			c.Abort()
			return
		}

		c.Next()
	}
}

func parseAuthTokenFromRequest(r *http.Request) string {
	authHeader := r.Header.Get(AuthHeader)

	// Parse the token from the header
	if len(authHeader) > len(HeaderBearer) && strings.EqualFold(authHeader[0:len(HeaderBearer)], HeaderBearer) {
		// Default session token
		return authHeader[7:]
	}
	return ""
}
