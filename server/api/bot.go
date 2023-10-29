package api

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/app"
	"github.com/oseducation/knowledge-graph/model"
)

func (apiObj *API) initBot() {
	apiObj.Bots = apiObj.APIRoot.Group("/bots")

	apiObj.Bots.POST("/ask", authMiddleware(), askQuestion)
	apiObj.Bots.POST("/first", authMiddleware(), getBotPosts)
	apiObj.Bots.POST("/next", authMiddleware(), getBotPosts)
}

func askQuestion(c *gin.Context) {
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

	answer, err := a.AskQuestion(post)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, "Error while asking a question")
		a.Log.Error(err.Error())
		return
	}

	responseFormat(c, http.StatusCreated, answer)
}

type OldAndNewPosts struct {
	NewPost  *model.PostWithUser `json:"new_post"`
	OldPosts []*model.Post       `json:"old_posts"`
}

func getBotPosts(c *gin.Context) {
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

	locationID := fmt.Sprintf("%s_%s", session.UserID, app.BotID)

	options := &model.PostGetOptions{}
	model.ComposePostOptions(
		model.PostLocationID(locationID),
		model.PostPage(page),
		model.PostPerPage(perPage))(options)
	posts, err := a.GetPosts(options)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	newPost, err := a.CreateFirstPost(posts, session.UserID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	if newPost != nil {
		posts = append(posts, newPost)
	}

	responseFormat(c, http.StatusOK, posts)
}
