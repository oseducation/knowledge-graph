package app

import "github.com/oseducation/knowledge-graph/model"

func (a *App) CreateSession(session *model.Session) (*model.Session, error) {
	session.Token = ""
	return a.Store.Session().Save(session)
}

func (a *App) GetSession(token string) (*model.Session, error) {
	return a.Store.Session().Get(token)
}

func (a *App) GetSessions(userID string) ([]*model.Session, error) {
	return a.Store.Session().GetSessions(userID)
}

func (a *App) RevokeSession(session *model.Session) error {
	return a.Store.Session().Delete(session.ID)
}
