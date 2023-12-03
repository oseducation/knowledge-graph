package app

import "github.com/oseducation/knowledge-graph/model"

func (a *App) SaveUserInteraction(interaction *model.UserInteraction) error {
	return a.Store.UserInteraction().Save(interaction)
}
