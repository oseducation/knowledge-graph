package app

import (
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

func (a *App) CreateSession(session *model.Session) (*model.Session, error) {
	session.Token = ""
	return a.Store.Session().Save(session)
}

func (a *App) GetSession(token string) (*model.Session, error) {
	session, err := a.Store.Session().Get(token)
	if err != nil {
		return nil, errors.Wrap(err, "can't get session from db")
	}
	if session.IsExpired() {
		return nil, errors.New("session expired")
	}
	if a.Config.ServerSettings.SessionIdleTimeoutInMinutes > 0 &&
		!a.Config.ServerSettings.ExtendSessionLengthWithActivity {
		timeout := int64(a.Config.ServerSettings.SessionIdleTimeoutInMinutes) * 1000 * 60
		if (model.GetMillis() - session.LastActivityAt) > timeout {
			if err := a.RevokeSession(session); err != nil {
				a.Log.Error("Error while revoking session", log.Err(err))
			}
			return nil, errors.New("token time out")
		}
	}
	return session, nil
}

func (a *App) GetSessions(userID string) ([]*model.Session, error) {
	return a.Store.Session().GetSessions(userID)
}

func (a *App) RevokeSession(session *model.Session) error {
	return a.Store.Session().Delete(session.ID)
}

func (a *App) ExtendSessionIfNeeded(session *model.Session) bool {
	if !a.Config.ServerSettings.ExtendSessionLengthWithActivity {
		return false
	}

	if session == nil || session.IsExpired() {
		return false
	}

	now := model.GetMillis()
	timeLeft := session.ExpiresAt - now
	sessionLengthInMillis := int64(a.Config.ServerSettings.SessionLengthInMinutes) * 60 * 1000

	// if less than half is passed do not extend the session(so that it will not be extended on every hit)
	if timeLeft > sessionLengthInMillis/2 {
		return false
	}

	session.ExpiresAt = now + sessionLengthInMillis
	if err := a.Store.Session().Update(session); err != nil {
		a.Log.Error("can't update expireAt for the session", log.Err(err))
		return false
	}
	return true
}
