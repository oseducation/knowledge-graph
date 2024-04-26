package app

import "github.com/oseducation/knowledge-graph/model"

func (a *App) CreateNote(userNote *model.UserNodeNote) (*model.UserNodeNote, error) {
	return a.Store.NodeNote().Save(userNote)
}

func (a *App) UpdateNote(userNote *model.UserNodeNote) error {
	return a.Store.NodeNote().Update(userNote)
}

func (a *App) DeleteNote(userNote *model.UserNodeNote) error {
	return a.Store.NodeNote().Delete(userNote)
}

func (a *App) GetNotesForUser(userID string) ([]*model.UserNodeNote, error) {
	notes, err := a.Store.NodeNote().GetNotesForUser(userID)
	if err != nil {
		return nil, err
	}
	for _, note := range notes {
		note.Note = ""
	}
	return notes, nil
}

func (a *App) GetUserNodeNote(ID string) (*model.UserNodeNote, error) {
	return a.Store.NodeNote().Get(ID)
}
