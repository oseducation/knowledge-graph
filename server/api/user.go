package api

func (apiObj *API) initUser() {
	apiObj.Users = apiObj.APIRoot.Group("/users")

	apiObj.Users.POST("/login", apiObj.jwtMiddleware.LoginHandler)
	apiObj.Users.POST("/logout", apiObj.jwtMiddleware.LogoutHandler)
}
