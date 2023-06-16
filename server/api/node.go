package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

const (
	defaultNodePage    = -1
	defaultNodePerPage = -1
)

func (apiObj *API) initNode() {
	apiObj.Nodes = apiObj.APIRoot.Group("/nodes")

	apiObj.Nodes.GET("/", authMiddleware(), requireNodePermissions(), getNodes)
	apiObj.Nodes.POST("/", authMiddleware(), requireNodePermissions(), createNode)
	apiObj.Nodes.PUT("/", authMiddleware(), requireNodePermissions(), updateNode)
	apiObj.Nodes.DELETE("/", authMiddleware(), requireNodePermissions(), deleteNode)

	apiObj.Nodes.GET("/:nodeID", authMiddleware(), getNode)
	apiObj.Nodes.POST("/:nodeID/video/:videoID", authMiddleware(), addVideo)

	apiObj.Nodes.PUT("/:nodeID/status", authMiddleware(), updateNodeStatus)
}

func createNode(c *gin.Context) {
	node, err := model.NodeFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `node` in the request body")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	rnode, err := a.CreateNode(node)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, "Error while creating node")
		return
	}
	responseFormat(c, http.StatusCreated, rnode)
}

func getNodes(c *gin.Context) {
	termInName := c.DefaultQuery("term_in_name", "")
	termInDescription := c.DefaultQuery("term_in_description", "")
	page, err := strconv.Atoi(c.DefaultQuery("page", strconv.Itoa(defaultNodePage)))
	if err != nil {
		page = defaultUserPage
	}
	perPage, err := strconv.Atoi(c.DefaultQuery("per_page", strconv.Itoa(defaultNodePerPage)))
	if err != nil {
		perPage = defaultUserPerPage
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	options := &model.NodeGetOptions{}
	model.ComposeNodeOptions(
		model.TermInName(termInName),
		model.TermInDescription(termInDescription),
		model.NodePage(page),
		model.NodePerPage(perPage))(options)
	nodes, err := a.GetNodes(options)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, nodes)
}

func updateNode(c *gin.Context) {
	updatedNode, err := model.NodeFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `node` in the request body")
		return
	}
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	err = a.UpdateNode(updatedNode)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, "Node updated")
}

func deleteNode(c *gin.Context) {
	nodeID := c.Query("node_id")
	if nodeID == "" {
		responseFormat(c, http.StatusBadRequest, "missing node_id")
		return
	}
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	node, err := a.Store.Node().Get(nodeID)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "unknown node")
		return
	}

	if err = a.DeleteNode(node); err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusOK, "Node deleted")
}

func getNode(c *gin.Context) {
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

	// if we have session extend it
	if session, err2 := getSession(c); err2 == nil {
		a.ExtendSessionIfNeeded(session)
	}

	nodes, err := a.GetNode(nodeID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, nodes)
}

func addVideo(c *gin.Context) {
	nodeID := c.Param("nodeID")
	if nodeID == "" {
		responseFormat(c, http.StatusBadRequest, "missing node_id")
		return
	}

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
	session, err := getSession(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	a.ExtendSessionIfNeeded(session)

	updatedVideo, err := a.AddVideoToNode(nodeID, videoID, session.UserID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, updatedVideo)
}

func updateNodeStatus(c *gin.Context) {
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

	nodeID := c.Param("nodeID")
	if nodeID == "" {
		responseFormat(c, http.StatusBadRequest, "missing node_id")
		return
	}

	status, err := model.NodeStatusForUserFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "wrong status")
		return
	}

	if session.UserID != status.UserID {
		responseFormat(c, http.StatusBadRequest, "userID mismatch")
		return
	}

	if nodeID != status.NodeID {
		responseFormat(c, http.StatusBadRequest, "nodeID mismatch")
		return
	}

	if err := a.UpdateStatus(status); err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, "status updated")
}
