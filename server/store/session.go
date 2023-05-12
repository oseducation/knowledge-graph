package store

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// SessionStore is an interface to crud sessions
type SessionStore interface {
	Get(sessionIDOrToken string) (*model.Session, error)
	Save(session *model.Session) (*model.Session, error)
	GetSessions(userID string) ([]*model.Session, error)
	Delete(sessionIDOrToken string) error
}

// SQLSessionStore is a struct to store session
type SQLSessionStore struct {
	sqlStore      *SQLStore
	sessionSelect sq.SelectBuilder
}

// NewSessionStore creates a new store for sessions.
func NewSessionStore(db *SQLStore) SessionStore {
	sessionSelect := db.builder.
		Select(
			"s.id",
			"s.token",
			"s.create_at",
			"s.expires_at",
			"s.last_activity_at",
			"s.user_id",
			"s.role",
		).
		From("sessions s")

	return &SQLSessionStore{
		sqlStore:      db,
		sessionSelect: sessionSelect,
	}
}

func (ss SQLSessionStore) Save(session *model.Session) (*model.Session, error) {
	if session.ID != "" {
		return nil, errors.New("sessionID is set")
	}

	session.BeforeSave()
	if err := session.IsValid(); err != nil {
		return nil, err
	}

	if _, err := ss.sqlStore.execBuilder(ss.sqlStore.db, sq.
		Insert("sessions").
		SetMap(map[string]interface{}{
			"id":               session.ID,
			"token":            session.Token,
			"create_at":        session.CreateAt,
			"expires_at":       session.ExpiresAt,
			"last_activity_at": session.LastActivityAt,
			"user_id":          session.UserID,
			"role":             session.Role,
		})); err != nil {
		return nil, errors.Wrapf(err, "can't save session with id:%s and user_id:%s", session.ID, session.UserID)
	}

	return session, nil
}

func (ss SQLSessionStore) Get(sessionIDOrToken string) (*model.Session, error) {
	session := model.Session{}
	if err := ss.sqlStore.getBuilder(ss.sqlStore.db, &session, ss.sessionSelect.Where(
		sq.Or{
			sq.Eq{"token": sessionIDOrToken},
			sq.Eq{"ID": sessionIDOrToken},
		},
	)); err != nil {
		return nil, errors.Wrapf(err, "can't get session by id or token: %s", sessionIDOrToken)
	}
	return &session, nil
}

func (ss SQLSessionStore) GetSessions(userID string) ([]*model.Session, error) {
	sessions := []*model.Session{}
	if err := ss.sqlStore.selectBuilder(ss.sqlStore.db, &sessions, ss.sessionSelect.
		Where(sq.Eq{"user_id": userID}).
		OrderBy("last_activity_at DESC")); err != nil {
		return nil, errors.Wrapf(err, "can't get sessions for user: %s", userID)
	}
	return sessions, nil
}

func (ss SQLSessionStore) Delete(sessionIDOrToken string) error {
	if _, err := ss.sqlStore.execBuilder(ss.sqlStore.db, sq.
		Delete("sessions").
		Where(sq.Or{
			sq.Eq{"token": sessionIDOrToken},
			sq.Eq{"ID": sessionIDOrToken},
		})); err != nil {
		return errors.Wrapf(err, "failed to delete session with id or token '%s'", sessionIDOrToken)
	}
	return nil
}
