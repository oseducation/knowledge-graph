package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initUserInteractions() {
	apiObj.Interactions = apiObj.APIRoot.Group("/interactions")

	apiObj.Interactions.POST("", authMiddleware(), saveInteraction)
}

func saveInteraction(c *gin.Context) {
	interaction, err := model.UserInteractionFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `interaction` in the request body")
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

	if session.UserID != interaction.UserID {
		responseFormat(c, http.StatusBadRequest, "UserID mismatch")

	}

	// if we have session extend it
	a.ExtendSessionIfNeeded(session)

	if err := a.SaveUserInteraction(interaction); err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, "")
}
