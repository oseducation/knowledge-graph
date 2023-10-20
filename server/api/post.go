package api

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initPost() {
	apiObj.Posts = apiObj.APIRoot.Group("/posts")

	apiObj.Posts.GET("/", authMiddleware(), getPosts)
	apiObj.Posts.POST("/", authMiddleware(), createPost)
	apiObj.Posts.PUT("/", authMiddleware(), updateMyPost)
	apiObj.Posts.DELETE("/:postID", authMiddleware(), deleteMyPost)
	apiObj.Posts.GET("/:postID", authMiddleware(), getMyPost)
}

func createPost(c *gin.Context) {
	post, err := model.PostFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `post` in the request body")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	rpost, err := a.CreatePost(post)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, "Error while creating post")
		return
	}
	responseFormat(c, http.StatusCreated, rpost)
}

// TODO: fix data leak!
func getPosts(c *gin.Context) {
	term := c.DefaultQuery("term", "")
	userID := c.DefaultQuery("user_id", "")
	locationID := c.DefaultQuery("location_id", "")
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

	session, err := getSession(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	if locationID == "" {
		responseFormat(c, http.StatusForbidden, "pick a location")
		return
	}

	if len(locationID) > 26 && !strings.Contains(locationID, session.UserID) {
		responseFormat(c, http.StatusForbidden, "invalid location")
		return
	}

	options := &model.PostGetOptions{}
	model.ComposePostOptions(
		model.TermInMessage(term),
		model.PostUserID(userID),
		model.PostLocationID(locationID),
		model.PostPage(page),
		model.PostPerPage(perPage))(options)
	posts, err := a.GetPosts(options)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, posts)
}

func updateMyPost(c *gin.Context) {
	updatedPost, err := model.PostFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `post` in the request body")
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

	oldPost, err := a.GetPost(updatedPost.ID)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "unknown post")
		return
	}

	if session.UserID != oldPost.UserID {
		responseFormat(c, http.StatusForbidden, "unknown post")
		return
	}

	err = a.UpdatePost(updatedPost)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, "Post updated")
}

func deleteMyPost(c *gin.Context) {
	postID := c.Param("postID")
	if postID == "" {
		responseFormat(c, http.StatusBadRequest, "missing post_id")
		return
	}
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	post, err := a.Store.Post().Get(postID)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "unknown post")
		return
	}

	session, err := getSession(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	if post.UserID != session.UserID {
		responseFormat(c, http.StatusForbidden, "unknown post")
		return
	}

	if err = a.DeletePost(post); err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusOK, "Post deleted")
}

func getMyPost(c *gin.Context) {
	postID := c.Param("postID")
	if postID == "" {
		responseFormat(c, http.StatusBadRequest, "missing post_id")
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
	a.ExtendSessionIfNeeded(session)

	post, err := a.GetPost(postID)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "unknown post")
		a.Log.Error(err.Error())
		return
	}

	if post.UserID != session.UserID {
		responseFormat(c, http.StatusForbidden, "unknown post")
		return
	}

	responseFormat(c, http.StatusOK, post)
}
