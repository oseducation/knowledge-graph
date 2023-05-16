package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initGraph() {
	apiObj.Nodes = apiObj.APIRoot.Group("/graph")

	apiObj.Nodes.GET("/", splitAuthMiddleware(graphForUser, graphWithoutSession))
}

func graphForUser(c *gin.Context) {
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

	statuses, err := a.GetStatusesForUser(session.UserID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	statusMap := map[string]*model.NodeStatusForUser{}
	for _, status := range statuses {
		statusMap[status.NodeID] = status
	}

	gr := a.GetFrontEndGraph()
	for i, node := range gr.Nodes {
		if status, ok := statusMap[node.ID]; ok {
			gr.Nodes[i].Status = status.Status
		}
	}
	responseFormat(c, http.StatusOK, gr)
}

func graphWithoutSession(c *gin.Context) {
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	gr := a.GetFrontEndGraph()
	responseFormat(c, http.StatusOK, gr)
}
