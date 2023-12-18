package app

import (
	"database/sql"

	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// CreateGoal creates new goal for a user
func (a *App) CreateGoal(userID, nodeID string) error {
	goal, err := a.Store.Goal().Get(userID, nodeID)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return errors.Wrap(err, "can't get goal")
	}
	if goal != nil && goal.FinishedAt != 0 { // already finished
		return nil
	}
	if goal != nil && goal.DeletedAt == 0 { // goal is already set
		return nil
	}

	if goal != nil {
		if err2 := a.Store.Goal().Reset(userID, nodeID); err != nil {
			return errors.Wrap(err2, "can't reset goal")
		}
		return nil
	}

	// no goal is set, create new one
	err = a.Store.Goal().Save(userID, nodeID)
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
func (a *App) GetGoals(userID string) ([]*model.GoalWithData, error) {
	goals, err := a.Store.Goal().GetAllWithData(userID)
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
	if defaultGoal == "" {
		return []*model.GoalWithData{}, nil
	}
	node, err := a.Store.Node().Get(defaultGoal)
	if err != nil {
		return nil, errors.Wrapf(err, "can't get node = %s", defaultGoal)
	}

	return []*model.GoalWithData{{
		NodeID:               defaultGoal,
		Name:                 node.Name,
		ThumbnailRelativeURL: node.ThumbnailURL,
	}}, nil
}
