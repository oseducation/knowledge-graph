package model

import (
	"encoding/json"
	"io"

	"github.com/pkg/errors"
)

// Goal type defines Knowledge Graph goal
type Goal struct {
	UserID     string `json:"user_id" db:"user_id"`
	NodeID     string `json:"node_id" db:"node_id"`
	CreatedAt  int64  `json:"created_at,omitempty" db:"created_at"`
	FinishedAt int64  `json:"finished_at,omitempty" db:"finished_at"`
	DeletedAt  int64  `json:"deleted_at" db:"deleted_at"`
}

// Goal type defines Knowledge Graph goal
type GoalWithData struct {
	NodeID               string `json:"node_id" db:"node_id"`
	Name                 string `json:"name" db:"name"`
	ThumbnailRelativeURL string `json:"thumbnail_relative_url" db:"thumbnail_relative_url"`
}

// IsValid validates the node and returns an error if it isn't configured correctly.
func (g *Goal) IsValid() error {
	if !IsValidID(g.UserID) {
		return invalidGoalError("userID", g.UserID)
	}

	if !IsValidID(g.NodeID) {
		return invalidGoalError("nodeID", g.NodeID)
	}

	if g.CreatedAt == 0 {
		return invalidGoalError("createdAt", g.CreatedAt)
	}

	if g.FinishedAt != 0 && g.FinishedAt < g.CreatedAt {
		return invalidGoalError("finishedAt", g.FinishedAt)
	}

	return nil
}

// BeforeSave should be called before storing the Goal
func (g *Goal) BeforeSave() {
	if g.CreatedAt == 0 {
		g.CreatedAt = GetMillis()
	}
}

// GoalFromJSON will decode the input and return a Goal
func GoalFromJSON(data io.Reader) (*Goal, error) {
	var goal *Goal
	if err := json.NewDecoder(data).Decode(&goal); err != nil {
		return nil, errors.Wrap(err, "can't decode goal")
	}
	return goal, nil
}

func invalidGoalError(fieldName string, fieldValue any) error {
	return errors.Errorf("invalid goal error. %s=%v", fieldName, fieldValue)
}
