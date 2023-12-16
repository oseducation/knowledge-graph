package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initDashboard() {
	apiObj.Dashboard = apiObj.APIRoot.Group("/dashboard")

	apiObj.Dashboard.GET("/finished_nodes", authMiddleware(), topics)
	apiObj.Dashboard.GET("/todays_activity", authMiddleware(), activity)
	apiObj.Dashboard.GET("/progress", authMiddleware(), progress)
	apiObj.Dashboard.GET("/performers", authMiddleware(), performers)
	apiObj.Dashboard.GET("/steak", authMiddleware(), steak)
	apiObj.Dashboard.GET("/number_of_bot_posts_monthly", authMiddleware(), getNumberOfBotPostsForUser)
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
	responseFormat(c, http.StatusOK, map[string]interface{}{
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

	responseFormat(c, http.StatusOK, map[string]interface{}{
		"nodes_finished_today": finishedNodesToday,
		"nodes_started_today":  startedNodesToday,
		"nodes_watched_today":  watchedNodesToday,
	})
}

func progress(c *gin.Context) {
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

	m, err := a.Store.Node().GetFinishedNodesProgress(session.UserID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusOK, m)
}

func performers(c *gin.Context) {
	nString := c.Query("n")
	n := 3
	var err error
	if nString != "" {
		n, err = strconv.Atoi(nString)
		if err != nil {
			responseFormat(c, http.StatusBadRequest, err.Error())
			return
		}
	}
	daysString := c.Query("days")
	days := 3
	if daysString != "" {
		days, err = strconv.Atoi(daysString)
		if err != nil {
			responseFormat(c, http.StatusBadRequest, err.Error())
			return
		}
	}
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	users, err := a.Store.Node().TopPerformers(days, n)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusOK, users)
}

func steak(c *gin.Context) {
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

	steak, maxSteak, today, err := a.Store.Node().LearningSteak(session.UserID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusOK, map[string]interface{}{
		"current_steak": steak,
		"max_steak":     maxSteak,
		"today":         today,
	})
}

func getNumberOfBotPostsForUser(c *gin.Context) {
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

	now := time.Now()
	beginningOfTheMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location()).UnixNano() / int64(time.Millisecond)
	countThisMonth, err := a.CountChatGPTPosts(session.UserID, beginningOfTheMonth)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	weekAgo := time.Now().AddDate(0, -1, 0).UnixNano() / int64(time.Millisecond)
	countThisWeek, err := a.CountChatGPTPosts(session.UserID, weekAgo)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusOK, map[string]interface{}{
		"bot_posts_month": countThisMonth,
		"bot_posts_week":  countThisWeek,
		"max_posts":       a.Config.ChatSettings.ChatGPTMonthlyLimit,
	})
}
