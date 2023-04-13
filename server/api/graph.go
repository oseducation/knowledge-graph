package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initGraph() {
	apiObj.Nodes = apiObj.APIRoot.Group("/graph")

	apiObj.Nodes.GET("/", getGraph)
}

func getGraph(c *gin.Context) {
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	gr := model.FrontendGraph{}
	gr.Nodes = make([]model.FrontendNodes, 0, len(a.Graph.Nodes))
	for _, node := range a.Graph.Nodes {
		gr.Nodes = append(gr.Nodes, model.FrontendNodes{
			ID:          node.ID,
			Name:        node.Name,
			Description: node.Description,
		})
	}
	gr.Links = []model.FrontendLinks{}
	for nodeID, prereqs := range a.Graph.Prerequisites {
		for _, prereq := range prereqs {
			gr.Links = append(gr.Links, model.FrontendLinks{
				Source: prereq,
				Target: nodeID,
			})
		}
	}

	responseFormat(c, http.StatusOK, "", gr)
}
