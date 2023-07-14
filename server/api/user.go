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

const (
	sessionKey  = "session"
	headerToken = "Token"
)

func (apiObj *API) initUser() {
	apiObj.Users = apiObj.APIRoot.Group("/users")

	apiObj.Users.POST("/login", login)
	apiObj.Users.POST("/logout", authMiddleware(), logout)
	apiObj.Users.GET("/me", authMiddleware(), getMe)
	apiObj.Users.PUT("/me", authMiddleware(), patchCurrentUser)

	apiObj.Users.POST("/register", registerUser)
	apiObj.Users.POST("/email/verify", verifyUserEmail)
	apiObj.Users.POST("/email/verify/send", sendVerificationEmail)

	apiObj.Users.GET("/", authMiddleware(), requireUserPermissions(), getUsers)
	apiObj.Users.POST("/", authMiddleware(), requireUserPermissions(), createUser)
	apiObj.Users.PUT("/", authMiddleware(), requireUserPermissions(), updateUser)
	apiObj.Users.DELETE("/", authMiddleware(), requireUserPermissions(), deleteUser)
}

func patchCurrentUser(c *gin.Context) {
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
	session, err := getSession(c)

	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	if session.UserID != updatedUser.ID {
		responseFormat(c, http.StatusForbidden, "user mismatch")
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

func login(c *gin.Context) {
	userLogin, err := model.UserLoginFromJSON(c.Request.Body)
	if err != nil {
		responseFormat(c, http.StatusBadRequest, "Invalid or missing `userLogin` in the request body")
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	user, err := a.AuthenticateUser(userLogin.Email, userLogin.Password)
	if err != nil {
		responseFormat(c, http.StatusUnauthorized, err.Error())
		return
	}

	session := &model.Session{
		UserID:    user.ID,
		Role:      user.Role,
		ExpiresAt: model.GetMillis() + int64(a.Config.ServerSettings.SessionLengthInMinutes)*60*1000,
	}
	session, err = a.CreateSession(session)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.Set(sessionKey, session)
	c.SetCookie(
		headerToken,
		session.Token,
		a.Config.ServerSettings.SessionLengthInMinutes*60*1000,
		"/",
		a.Config.ServerSettings.CookieDomain,
		a.Config.ServerSettings.HTTPS,
		true,
	)
	responseFormat(c, http.StatusOK, user)
}

// Get the user from the session and return it in the response
func getMe(c *gin.Context) {
	session, err := getSession(c)
	if err != nil {
		responseFormat(c, http.StatusUnauthorized, err.Error())
		return
	}

	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	user, err := a.GetUser(session.UserID)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	responseFormat(c, http.StatusOK, user)
}

func logout(c *gin.Context) {
	a, err := getApp(c)
	if err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	session, err := getSession(c)
	if err != nil {
		responseFormat(c, http.StatusUnauthorized, err.Error())
		return
	}

	if err := a.RevokeSession(session); err != nil {
		responseFormat(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.Writer.Header().Del(headerToken)
	responseFormat(c, http.StatusOK, "")
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
