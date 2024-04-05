package api

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (apiObj *API) initSubscriptions() {
	apiObj.Subscriptions = apiObj.APIRoot.Group("/subscriptions")
	apiObj.Subscriptions.POST("/stripe_webhook", handleStripeWebhook)
}

func handleStripeWebhook(c *gin.Context) {
	const maxBodyBytes = int64(65536)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBodyBytes)
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
	err = a.HandleStripeWebhook(payload, signature)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, nil)
}
