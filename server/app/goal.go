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
	maxGoals := 3
	goals, err := a.Store.Goal().GetAllWithData(userID)
	if err != nil {
		return nil, errors.Wrapf(err, "userID = %s", userID)
	}

	if len(goals) >= maxGoals {
		return goals[:maxGoals], nil
	}
	defaultGoals, err := a.Store.Goal().DefaultGoalsForUser(userID)
	if err != nil {
		return nil, errors.Wrap(err, "can't get default goals")
	}

	for i := 0; len(goals) < maxGoals && i < len(defaultGoals); i++ {
		node, err := a.Store.Node().Get(defaultGoals[i])
		if err != nil {
			return nil, errors.Wrapf(err, "can't get node = %s", defaultGoals[i])
		}
		goals = append(goals, &model.GoalWithData{
			NodeID:               defaultGoals[i],
			Name:                 node.Name,
			ThumbnailRelativeURL: node.ThumbnailURL,
		})
	}

	if maxGoals > len(goals) {
		maxGoals = len(goals)
	}

	return goals[:maxGoals], nil
}
