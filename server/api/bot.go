package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/app"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/oseducation/knowledge-graph/services"
)

const (
	defaultPostsPage    = 0
	defaultPostsPerPage = 50
)

func (apiObj *API) initBot() {
	apiObj.Bots = apiObj.APIRoot.Group("/bots")

	apiObj.Bots.POST("/ask", authMiddleware(), askQuestion)
	apiObj.Bots.POST("/first", authMiddleware(), getBotPosts)
	apiObj.Bots.POST("/next", authMiddleware(), getBotPosts)
	apiObj.Bots.POST("/correct_answer", authMiddleware(), getResponseToCorrectAnswer)
	apiObj.Bots.POST("/incorrect_answer", authMiddleware(), getResponseToIncorrectAnswer)

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
	gptModel := services.FreeGPT
	if session.Role != model.UserRole {
		gptModel = services.PremiumGPT
	}

	isStream := c.DefaultQuery("stream", "")

	if isStream != "true" {
		answer, gptErr := a.AskQuestionToChatGPT(post.Message, nodeID, post.UserID, gptModel)
		if gptErr != nil {
			responseFormat(c, http.StatusInternalServerError, "Error while asking a question")
			a.Log.Error(gptErr.Error())
			return
		}

		responseFormat(c, http.StatusCreated, answer)
		return
	}

	userIntent, err := a.GetUserIntent(post.Message, post.UserID, nodeID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, "Error getting user intent")
		a.Log.Error(err.Error())
		return
	}

	var chatStream services.ChatStream
	var chatStreamErr error

	if userIntent.Intent == app.QuestionOnCurrentTopicIntent {
		// a question about the current topic
		chatStream, chatStreamErr = a.AskQuestionToChatGPTSteam(post.Message, nodeID, post.UserID, gptModel)
	} else if userIntent.Intent == app.QuestionOnOffTopicIntent {
		// an off-topic question
		chatStream, chatStreamErr = a.AskQuestionToChatGPTSteamOffTopic()
	} else if userIntent.Intent == app.QuestionOnDifferentTopicIntent {
		// some other topic from the course
		chatStream, chatStreamErr = a.AskQuestionToChatGPTSteamOnDifferentTopic(post.Message, userIntent.TopicID, post.UserID, gptModel)
	} else if userIntent.Intent == app.DialogueIntent {
		chatStream, chatStreamErr = a.AskQuestionToChatGPTSteamOnTopicDialogue(post.Message, nodeID, post.UserID, gptModel, userIntent.PrevPosts)
	} else if userIntent.Intent != "" {
		// show text or show video
		chatStream = services.CreateStringStream(fmt.Sprintf("{intent: %s}", userIntent.Intent))
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

func getResponseToCorrectAnswer(c *gin.Context) {
	var questionID string
	if err := json.NewDecoder(c.Request.Body).Decode(&questionID); err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `questionID` in the request body")
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

	question, err := a.GetQuestion(questionID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	gptModel := services.FreeGPT
	if session.Role != model.UserRole {
		gptModel = services.PremiumGPT
	}

	chatStream, err := a.GetResponseToCorrectAnswerStream(question.Explanation, session.UserID, gptModel)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, "Error while getting response to correct answer stream")
		a.Log.Error(err.Error())
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

func getResponseToIncorrectAnswer(c *gin.Context) {
	type IncorrectAnswer struct {
		QuestionID      string `json:"question_id"`
		IncorrectAnswer string `json:"incorrect_answer"`
	}
	var data IncorrectAnswer
	if err := json.NewDecoder(c.Request.Body).Decode(&data); err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `IncorrectAnswer` in the request body")
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

	question, err := a.GetQuestion(data.QuestionID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	gptModel := services.FreeGPT
	if session.Role != model.UserRole {
		gptModel = services.PremiumGPT
	}

	chatStream, err := a.GetResponseToIncorrectAnswerStream(question, data.IncorrectAnswer, session.UserID, gptModel)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, "Error while getting response to correct answer stream")
		a.Log.Error(err.Error())
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
	page, err := strconv.Atoi(c.DefaultQuery("page", strconv.Itoa(defaultPostsPage)))
	if err != nil {
		page = defaultUserPage
	}
	perPage, err := strconv.Atoi(c.DefaultQuery("per_page", strconv.Itoa(defaultPostsPage)))
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
