package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/app"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

const (
	defaultUserSearchTerm = ""
	defaultUserPage       = -1
	defaultUserPerPage    = -1
)

func (apiObj *API) initUser() {
	apiObj.Users = apiObj.APIRoot.Group("/users")

	apiObj.Users.POST("/login", apiObj.jwtMiddleware.LoginHandler)
	apiObj.Users.POST("/logout", apiObj.jwtMiddleware.LogoutHandler)

	apiObj.Users.POST("/register", registerUser)

	apiObj.Users.GET("/", apiObj.jwtMiddleware.MiddlewareFunc(), getUsers)

}

func registerUser(c *gin.Context) {
	user := model.UserFromJSON(c.Request.Body)
	if user == nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `user` in the request body", nil)
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	ruser, err := a.CreateUserFromSignUp(user)
	if err != nil {
		a.Log.Error("Can't register a user", log.Err(err))
		responseFormat(c, http.StatusConflict, "User already exists", user)
		return
	}
	responseFormat(c, http.StatusCreated, "User registered", ruser)
}

func getUsers(c *gin.Context) {
	term := c.DefaultQuery("term", defaultUserSearchTerm)
	page, err := strconv.Atoi(c.DefaultQuery("page", strconv.Itoa(defaultUserPage)))
	if err != nil {
		page = defaultUserPage
	}
	perPage, err := strconv.Atoi(c.DefaultQuery("perPage", strconv.Itoa(defaultUserPerPage)))
	if err != nil {
		perPage = defaultUserPerPage
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	options := &model.UserGetOptions{}
	model.ComposeOptions(model.Term(term), model.Page(page), model.PerPage(perPage))(options)
	users, err := a.GetUsers(options)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}
	responseFormat(c, http.StatusOK, "", users)
}

func getApp(c *gin.Context) (*app.App, error) {
	appInt, ok := c.Get("app")
	if !ok {
		return nil, errors.New("Missing application in the context")
	}
	a, ok := appInt.(*app.App)
	if !ok {
		return nil, errors.New("Wrong data type of the application in the context")
	}
	return a, nil
}
