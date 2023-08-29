package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initGraph() {
	apiObj.Nodes = apiObj.APIRoot.Group("/graph")

	apiObj.Nodes.GET("/", splitAuthMiddleware(getMyGraph, getGraph))
}

func getMyGraph(c *gin.Context) {
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

	gr, err := a.GetGraphForUser(session.UserID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusOK, gr)
}

func getGraph(c *gin.Context) {
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	gr := a.GetFrontEndGraph(model.LanguageEnglish)
	responseFormat(c, http.StatusOK, gr)
}
