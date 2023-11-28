package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (apiObj *API) initGoal() {
	apiObj.Goals = apiObj.APIRoot.Group("/goals")

	apiObj.Goals.GET("/:userID", authMiddleware(), getGoals)
	apiObj.Goals.POST("/:userID/nodes/:nodeID", authMiddleware(), addGoal)
	apiObj.Goals.DELETE("/:userID/nodes/:nodeID", authMiddleware(), deleteGoal)
}

func addGoal(c *gin.Context) {
	userID := c.Param("userID")
	if userID == "" {
		responseFormat(c, http.StatusBadRequest, "missing user_id")
		return
	}

	nodeID := c.Param("nodeID")
	if nodeID == "" {
		responseFormat(c, http.StatusBadRequest, "missing node_id")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	err = a.CreateGoal(userID, nodeID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusCreated, "")
}

func deleteGoal(c *gin.Context) {
	userID := c.Param("userID")
	if userID == "" {
		responseFormat(c, http.StatusBadRequest, "missing user_id")
		return
	}

	nodeID := c.Param("nodeID")
	if nodeID == "" {
		responseFormat(c, http.StatusBadRequest, "missing node_id")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	err = a.DeleteGoal(userID, nodeID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, "")
}

func getGoals(c *gin.Context) {
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

	if userID != session.UserID {
		responseFormat(c, http.StatusBadRequest, "user mismatch")
		return
	}

	goals, err := a.GetGoals(userID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusOK, goals)
}
