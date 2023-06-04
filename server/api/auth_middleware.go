package api

import (
	"github.com/gin-gonic/gin"
	"strings"

	"net/http"
)

const AuthHeader = "Authorization"
const HeaderBearer = "Bearer"

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := parseAuthTokenFromRequest(c.Request)
		if token == "" {
			responseFormat(c, http.StatusUnauthorized, "missing token")
			c.Abort()
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

func splitAuthMiddleware(withSession gin.HandlerFunc, withoutSession gin.HandlerFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		a, err := getApp(c)
		if err != nil {
			responseFormat(c, http.StatusInternalServerError, err.Error())
			c.Abort()
			return
		}

		token := parseAuthTokenFromRequest(c.Request)
		if token == "" {
			withoutSession(c)
			return
		}

		session, err := a.GetSession(token)
		if err != nil {
			withoutSession(c)
			return
		}

		c.Set(sessionKey, session)
		withSession(c)
		c.Next()
	}
}

func parseAuthTokenFromRequest(r *http.Request) string {
	authHeader := r.Header.Get(AuthHeader)
	if len(authHeader) > len(HeaderBearer) && strings.EqualFold(authHeader[0:len(HeaderBearer)], HeaderBearer) {
		// Default session token
		return authHeader[len(HeaderBearer)+1:]
	}
	cookie, err := r.Cookie("Token")
	if err != nil {
		return ""
	}
	return cookie.Value
}
