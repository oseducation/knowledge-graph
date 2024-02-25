package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (apiObj *API) initSubscriptions() {
	apiObj.Users = apiObj.APIRoot.Group("/plans")

	apiObj.Users.GET("/", getAvailablePlans)
	// apiObj.Users.GET("/:userID/subscriptions/", authMiddleware(), getUserSubscription)
	// apiObj.Users.POST("/:userID/subscriptions/:subID", authMiddleware(), craeteUserSubscription)
	// apiObj.Users.PUT("/:userID/subscriptions/:subID", authMiddleware(), updateUserSubscription)
	// apiObj.Users.DELETE("/:userID/subscriptions/:subID", authMiddleware(), deleteUserSubscription)
}

func getAvailablePlans(c *gin.Context) {
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	plans, err := a.GetPlans()
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, plans)
}
