package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initVideo() {
	apiObj.Videos = apiObj.APIRoot.Group("/videos")

	apiObj.Videos.GET("/next", authMiddleware(), getNextVideo)
	apiObj.Videos.GET("/view/:videoID", authMiddleware(), getVideo)
	apiObj.Videos.POST("/engage/:videoID", authMiddleware(), addUserEngagement)
}

func getVideo(c *gin.Context) {
	videoID := c.Param("videoID")
	if videoID == "" {
		responseFormat(c, http.StatusBadRequest, "missing video_id")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	// if we have session extend it
	if session, err2 := getSession(c); err2 == nil {
		a.ExtendSessionIfNeeded(session)
	}

	video, err := a.GetVideo(videoID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, video)
}

func addUserEngagement(c *gin.Context) {
	videoID := c.Param("videoID")
	if videoID == "" {
		responseFormat(c, http.StatusBadRequest, "missing video_id")
		return
	}

	data, err := model.UserEngagementDataFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "missing user engagement data")
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	// if we have session extend it
	session, err := getSession(c)
	if err == nil {
		a.ExtendSessionIfNeeded(session)
	}

	err = a.AddUserEngagement(session.UserID, videoID, data)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, "data added")
}

func getNextVideo(c *gin.Context) {
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

	videoID, err := a.GetNextVideo(session.UserID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusOK, videoID)
}
