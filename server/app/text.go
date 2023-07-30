package app

import (
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// GetText gets text by id
func (a *App) GetText(id string) (*model.Text, error) {
	text, err := a.Store.Text().Get(id)
	if err != nil {
		return nil, errors.Wrapf(err, "id = %s", id)
	}
	return text, nil
}
