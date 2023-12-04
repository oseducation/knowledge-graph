package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initDashboard() {
	apiObj.Dashboard = apiObj.APIRoot.Group("/dashboard")

	apiObj.Dashboard.GET("/finished_nodes", authMiddleware(), topics)
	apiObj.Dashboard.GET("/todays_activity", authMiddleware(), activity)
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

	finishedNodesThisWeek, err := a.Store.Node().GetNumberOfNodesInDaysWithStatus(session.UserID, 7, model.NodeStatusFinished)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusCreated, map[string]interface{}{
		"finished_nodes":           finishedNodes,
		"finished_nodes_this_week": finishedNodesThisWeek,
	})
}

func activity(c *gin.Context) {
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

	finishedNodesToday, err := a.Store.Node().GetNumberOfNodesInDaysWithStatus(session.UserID, 1, model.NodeStatusFinished)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	startedNodesToday, err := a.Store.Node().GetNumberOfNodesInDaysWithStatus(session.UserID, 1, model.NodeStatusStarted)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	watchedNodesToday, err := a.Store.Node().GetNumberOfNodesInDaysWithStatus(session.UserID, 1, model.NodeStatusWatched)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusCreated, map[string]interface{}{
		"nodes_finished_today": finishedNodesToday,
		"nodes_started_today":  startedNodesToday,
		"nodes_watched_today":  watchedNodesToday,
	})
}
