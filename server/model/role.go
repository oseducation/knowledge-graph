package model

import "errors"

type RoleType string

const (
	AdminRole = "admin"
	UserRole  = "user"
)

func (r RoleType) CanManageUsers() bool {
	return r == AdminRole
}

func (r RoleType) CanManageNodes() bool {
	return r == AdminRole
}

func FromStringToRole(role string) (RoleType, error) {
	if role != AdminRole && role != UserRole {
		return "", errors.New("unknown Role")
	}
	return RoleType(role), nil
}
