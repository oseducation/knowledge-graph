package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (apiObj *API) initText() {
	apiObj.Texts = apiObj.APIRoot.Group("/texts")

	apiObj.Texts.GET("/:textID", authMiddleware(), getText)
}

func getText(c *gin.Context) {
	textID := c.Param("textID")
	if textID == "" {
		responseFormat(c, http.StatusBadRequest, "missing text_id")
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

	text, err := a.GetText(textID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, text)
}
