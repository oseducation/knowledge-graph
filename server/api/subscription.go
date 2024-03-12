package api

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (apiObj *API) initSubscriptions() {
	apiObj.Users = apiObj.APIRoot.Group("/subscriptions")
	apiObj.Users.POST("/webhook", handleWebhook)
}

func handleWebhook(c *gin.Context) {
	const MaxBodyBytes = int64(65536)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	signature := c.GetHeader("Stripe-Signature")
	err = a.HandleWebhook(payload, signature)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, nil)
}
