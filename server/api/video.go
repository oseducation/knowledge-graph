package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (apiObj *API) initVideo() {
	apiObj.Videos = apiObj.APIRoot.Group("/videos")

	apiObj.Videos.GET("/:videoID", authMiddleware(), getVideo)
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
