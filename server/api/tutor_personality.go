package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initTutorPersonality() {
	apiObj.TutorPersonalities = apiObj.APIRoot.Group("/tutor-personalities")

	apiObj.TutorPersonalities.GET("", authMiddleware(), getTutorPersonalities)
}

func getTutorPersonalities(c *gin.Context) {
	responseFormat(c, http.StatusOK, model.DefaultTutorPersonalities)
}
