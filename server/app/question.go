package app

import (
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// GetQuestion gets question by id
func (a *App) GetQuestion(id string) (*model.Question, error) {
	text, err := a.Store.Question().Get(id)
	if err != nil {
		return nil, errors.Wrapf(err, "id = %s", id)
	}
	return text, nil
}

func (a *App) GetOnboardingQuestions(courseID string) ([][]*model.Question, error) {
	return a.Store.Question().GetOnboardingQuestions(courseID)
}
