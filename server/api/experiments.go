package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initExperiments() {
	apiObj.Experiments = apiObj.APIRoot.Group("/experiments")

	apiObj.Experiments.POST("", addExperiment)
}

func addExperiment(c *gin.Context) {
	experiment, err := model.ExperimentFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "invalid experiment user")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	if _, err := a.Store.Experiments().Save(experiment); err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusCreated, "added")
}
