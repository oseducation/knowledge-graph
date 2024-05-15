package model

import (
	"github.com/pkg/errors"
)

type Session struct {
	ID             string   `json:"id" db:"id"`
	Token          string   `json:"token" db:"token"`
	CreateAt       int64    `json:"create_at" db:"create_at"`
	ExpiresAt      int64    `json:"expires_at" db:"expires_at"`
	LastActivityAt int64    `json:"last_activity_at" db:"last_activity_at"`
	UserID         string   `json:"user_id" db:"user_id"`
	Role           RoleType `json:"role" db:"role"`
}

func (s *Session) IsValid() error {
	if !IsValidID(s.ID) {
		return invalidSessionError("", "id", s.ID)
	}

	if !IsValidID(s.UserID) {
		return invalidSessionError(s.ID, "userID", s.UserID)
	}

	if s.CreateAt == 0 {
		return invalidSessionError(s.ID, "CreateAt", s.CreateAt)
	}

	if s.Role != AdminRole && s.Role != UserRole && s.Role != CustomerRole {
		return invalidSessionError(s.ID, "Role", s.Role)
	}

	return nil
}

func (s *Session) BeforeSave() {
	if s.ID == "" {
		s.ID = NewID()
	}

	if s.Token == "" {
		s.Token = NewID()
	}

	s.CreateAt = GetMillis()
	s.LastActivityAt = s.CreateAt
}

func (s *Session) IsExpired() bool {
	if s.ExpiresAt <= 0 {
		return false
	}

	if GetMillis() > s.ExpiresAt {
		return true
	}

	return false
}

func (s *Session) CanManageNodes() bool {
	return s.Role.CanManageNodes()
}

func (s *Session) CanManageUsers() bool {
	return s.Role.CanManageUsers()
}

func invalidSessionError(sessionID, fieldName string, fieldValue any) error {
	return errors.Errorf("invalid session error. sessionID=%s %s=%v", sessionID, fieldName, fieldValue)
}
