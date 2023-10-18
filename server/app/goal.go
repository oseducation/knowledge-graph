package app

import (
	"fmt"

	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// CreateGoal creates new goal for a user
func (a *App) CreateGoal(userID, nodeID string) error {
	err := a.Store.Goal().Save(userID, nodeID)
	if err != nil {
		return errors.Wrapf(err, "userID = %s, nodeID = %s", userID, nodeID)
	}
	return nil
}

// FinishGoal finishes a goal for a user
func (a *App) FinishGoal(userID, nodeID string) error {
	err := a.Store.Goal().Finish(userID, nodeID)
	if err != nil {
		return errors.Wrapf(err, "userID = %s, nodeID = %s", userID, nodeID)
	}
	return nil
}

// DeleteGoal deletes a goal for a user
func (a *App) DeleteGoal(userID, nodeID string) error {
	err := a.Store.Goal().Delete(userID, nodeID)
	if err != nil {
		return errors.Wrapf(err, "userID = %s, nodeID = %s", userID, nodeID)
	}
	return nil
}

// DeleteGoal deletes a goal for a user
func (a *App) GetGoals(userID string) ([]*model.Goal, error) {
	goals, err := a.Store.Goal().Get(userID)
	if err != nil {
		return nil, errors.Wrapf(err, "userID = %s", userID)
	}
	if len(goals) > 0 {
		return goals, nil
	}
	defaultGoal, err := a.Store.Goal().NextDefaultGoalForUser(userID)
	if err != nil {
		return nil, errors.Wrap(err, "can't get default goals")
	}
	println(fmt.Sprintf("def %v", defaultGoal))
	if defaultGoal == "" {
		return []*model.Goal{}, nil
	}
	return []*model.Goal{{
		UserID:     userID,
		NodeID:     defaultGoal,
		DeletedAt:  0,
		FinishedAt: 0,
	}}, nil
}

// CreateSingleGoal creates a goal for a user, if there already was a goal it is deleted
func (a *App) CreateSingleGoal(userID, nodeID string) error {
	goals, err := a.Store.Goal().Get(userID)
	if err != nil {
		return errors.Wrapf(err, "userID = %s", userID)
	}

	for _, goal := range goals {
		if goal.DeletedAt != 0 {
			continue
		}
		err := a.DeleteGoal(goal.UserID, goal.NodeID)
		if err != nil {
			return errors.Wrapf(err, "can't delete goal userID = %s, nodeID = %s", userID, nodeID)
		}
	}

	return a.CreateGoal(userID, nodeID)
}
