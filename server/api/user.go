package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
)

const (
	defaultUserPage    = -1
	defaultUserPerPage = -1
)

func (apiObj *API) initUser() {
	apiObj.Users = apiObj.APIRoot.Group("/users")

	apiObj.Users.POST("/login", apiObj.jwtMiddleware.LoginHandler)
	apiObj.Users.POST("/logout", apiObj.jwtMiddleware.LogoutHandler)

	apiObj.Users.POST("/register", registerUser)
	apiObj.Users.POST("/email/verify", verifyUserEmail)
	apiObj.Users.POST("/email/verify/send", sendVerificationEmail)

	apiObj.Users.GET("/", apiObj.jwtMiddleware.MiddlewareFunc(), getUsers)
	apiObj.Users.POST("/", apiObj.jwtMiddleware.MiddlewareFunc(), createUser)
	apiObj.Users.PUT("/", apiObj.jwtMiddleware.MiddlewareFunc(), updateUser)
	apiObj.Users.DELETE("/", apiObj.jwtMiddleware.MiddlewareFunc(), deleteUser)
}

func registerUser(c *gin.Context) {
	user, err := model.UserFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `user` in the request body")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	ruser, err := a.CreateUserFromSignUp(user)
	if err != nil {
		a.Log.Error("Can't register a user", log.Err(err))
		responseFormat(c, http.StatusConflict, "User already exists")
		return
	}
	responseFormat(c, http.StatusCreated, ruser)
}

func getUsers(c *gin.Context) {
	term := c.DefaultQuery("term", "")
	page, err := strconv.Atoi(c.DefaultQuery("page", strconv.Itoa(defaultUserPage)))
	if err != nil {
		page = defaultUserPage
	}
	perPage, err := strconv.Atoi(c.DefaultQuery("per_page", strconv.Itoa(defaultUserPerPage)))
	if err != nil {
		perPage = defaultUserPerPage
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	authorID := c.GetString(identityKey)
	if !a.HasPermissionToManageUsers(authorID) {
		responseFormat(c, http.StatusForbidden, "No permission for this action")
		return
	}

	options := &model.UserGetOptions{}
	model.ComposeUserOptions(model.Term(term), model.UserPage(page), model.UserPerPage(perPage))(options)
	users, err := a.GetUsers(options)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, users)
}

func createUser(c *gin.Context) {
	user, err := model.UserFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `user` in the request body")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	authorID := c.GetString(identityKey)
	if !a.HasPermissionToManageUsers(authorID) {
		responseFormat(c, http.StatusForbidden, "No permission for this action")
		return
	}

	ruser, err := a.CreateUser(user)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, "Error while creating user")
		return
	}
	responseFormat(c, http.StatusCreated, ruser)
}

func updateUser(c *gin.Context) {
	updatedUser, err := model.UserFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `user` in the request body")
		return
	}
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	authorID := c.GetString(identityKey)
	if !a.HasPermissionToManageUsers(authorID) {
		responseFormat(c, http.StatusForbidden, "No permission for this action")
		return
	}

	oldUser, err := a.Store.User().Get(updatedUser.ID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	if oldUser.Email != updatedUser.Email ||
		oldUser.EmailVerified != updatedUser.EmailVerified {
		responseFormat(c, http.StatusForbidden, "user mismatch")
		return
	}

	err = a.UpdateUser(updatedUser)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, "User updated")
}

func deleteUser(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		responseFormat(c, http.StatusBadRequest, "missing user_id")
		return
	}
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	authorID := c.GetString(identityKey)
	if !a.HasPermissionToManageUsers(authorID) {
		responseFormat(c, http.StatusForbidden, "No permission for this action")
		return
	}

	user, err := a.Store.User().Get(userID)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "unknown user")
		return
	}

	if err = a.DeleteUser(user); err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusOK, "User deleted")
}

func verifyUserEmail(c *gin.Context) {
	props := model.MapFromJSON(c.Request.Body)
	token := props["token"]
	if len(token) != model.TokenSize {
		responseFormat(c, http.StatusBadRequest, "Invalid or token in the request body")
		return
	}
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	if err := a.VerifyEmailFromToken(token); err != nil {
		responseFormat(c, http.StatusBadRequest, err.Error())
		return
	}
	responseFormat(c, http.StatusOK, "email verified")
}

func sendVerificationEmail(c *gin.Context) {
	c.JSON(http.StatusOK, "sendVerificationEmail")
}
