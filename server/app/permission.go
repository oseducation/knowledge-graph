package app

func (a *App) HasPermissionToManageUsers(userID string) bool {
	user, err := a.Store.User().Get(userID)
	if err != nil {
		return false
	}
	return user.Role.CanManageUsers()
}

func (a *App) HasPermissionToManageNodes(userID string) bool {
	user, err := a.Store.User().Get(userID)
	if err != nil {
		return false
	}
	return user.Role.CanManageUsers()
}
