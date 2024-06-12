package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (apiObj *API) initQuestion() {
	apiObj.Questions = apiObj.APIRoot.Group("/questions")

	apiObj.Questions.GET("/:questionID", authMiddleware(), getQuestion)
	apiObj.Questions.GET("/onboarding/:courseID", getOnboardingQuestions)
}

func getQuestion(c *gin.Context) {
	questionID := c.Param("question_id")
	if questionID == "" {
		responseFormat(c, http.StatusBadRequest, "missing question_id")
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

	question, err := a.GetQuestion(questionID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, question)
}

func getOnboardingQuestions(c *gin.Context) {
	courseID := c.Param("courseID")
	if courseID == "" {
		responseFormat(c, http.StatusBadRequest, "missing course_id")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	questions, err := a.GetOnboardingQuestions(courseID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, questions)
}
