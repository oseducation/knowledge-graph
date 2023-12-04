package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (apiObj *API) initDashboard() {
	apiObj.Dashboard = apiObj.APIRoot.Group("/dashboard")

	apiObj.Dashboard.GET("/finished_nodes", authMiddleware(), topics)
}

func topics(c *gin.Context) {
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

	finishedNodes, err := a.Store.Node().GetNumberOfFinishedNodes(session.UserID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	finishedNodesThisWeek, err := a.Store.Node().GetNumberOfFinishedNodesThisWeek(session.UserID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusCreated, map[string]interface{}{
		"finished_nodes":           finishedNodes,
		"finished_nodes_this_week": finishedNodesThisWeek,
	})
}
