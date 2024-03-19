package api

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/oseducation/knowledge-graph/services"
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

	nodeIDInt, ok := post.Props["node_id"]
	if !ok {
		responseFormat(c, http.StatusBadRequest, "Missing `node_id` in the request body")
		return
	}
	nodeID, ok := nodeIDInt.(string)
	if !ok || !model.IsValidID(nodeID) {
		responseFormat(c, http.StatusBadRequest, "`node_id` not valid")
		return
	}

	session, err := getSession(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	if session.UserID != post.UserID {
		responseFormat(c, http.StatusBadRequest, "`user_id` mismatch")
		return
	}

	if !a.CheckLimit(session.UserID) {
		responseFormat(c, http.StatusBadRequest, "Monthly limit exceeded")
		return
	}

	isStream := c.DefaultQuery("stream", "")

	if isStream != "true" {
		answer, gptErr := a.AskQuestionToChatGPT(post.Message, nodeID, post.UserID)
		if gptErr != nil {
			responseFormat(c, http.StatusInternalServerError, "Error while asking a question")
			a.Log.Error(gptErr.Error())
			return
		}

		responseFormat(c, http.StatusCreated, answer)
		return
	}

	relatedTopicID, err := a.GetRelatedTopicID(post.Message, post.UserID, nodeID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, "Error getting related topic")
		return
	}

	var chatStream services.ChatStream
	var chatStreamErr error

	if relatedTopicID == nodeID {
		// a question about the current topic
		chatStream, chatStreamErr = a.AskQuestionToChatGPTSteam(post.Message, nodeID, post.UserID)
	} else if relatedTopicID == "" {
		// an off-topic question
		chatStream, chatStreamErr = a.AskQuestionToChatGPTSteamOffTopic()
	} else {
		// some other topic from the course
		chatStream, chatStreamErr = a.AskQuestionToChatGPTSteamOnDifferentTopic(post.Message, relatedTopicID, post.UserID)
	}
	if chatStreamErr != nil {
		responseFormat(c, http.StatusInternalServerError, "Error while asking a stream question")
		a.Log.Error(chatStreamErr.Error())
		return
	}

	defer chatStream.Close()

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Content-Encoding", "none")
	c.Writer.WriteHeaderNow()

	for {
		resp, err := chatStream.Recv()
		if errors.Is(err, io.EOF) {
			fmt.Fprintf(c.Writer, "data: {%s}\n\n", "[DONE]")
			c.Writer.Flush()
			return // stream finished
		}
		if err != nil {
			responseFormat(c, http.StatusInternalServerError, "Error while reading stream")
			a.Log.Error(err.Error())
			return
		}
		fmt.Fprintf(c.Writer, "data: {%s}\n\n", resp)
		c.Writer.Flush()
	}
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

	locationID := fmt.Sprintf("%s_%s", session.UserID, model.BotID)

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
