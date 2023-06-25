package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initPreferences() {
	apiObj.Preferences = apiObj.Users.Group("/:userID/preferences")

	apiObj.Preferences.GET("/", authMiddleware(), getPreferences)
	apiObj.Preferences.PUT("/", authMiddleware(), updatePreferences)
}

func getPreferences(c *gin.Context) {
	userID := c.Param("userID")
	if userID == "" {
		responseFormat(c, http.StatusBadRequest, "missing user_id")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	session, err := getSession(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	if session.UserID != userID && !session.CanManageUsers() {
		responseFormat(c, http.StatusForbidden, "user_id mismatch")
		return
	}

	preferences, err := a.GetPreferencesForUser(userID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, preferences)
}

func updatePreferences(c *gin.Context) {
	userID := c.Param("userID")
	if userID == "" {
		responseFormat(c, http.StatusBadRequest, "missing user_id")
		return
	}

	preferences, err := model.PreferencesFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, err.Error())
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	session, err := getSession(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	if session.UserID != userID {
		responseFormat(c, http.StatusForbidden, "user_id mismatch")
		return
	}

	err = a.UpdatePreferencesForUser(userID, preferences)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, "preferences were updated")
}
