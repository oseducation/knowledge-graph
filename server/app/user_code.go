package app

import "github.com/oseducation/knowledge-graph/model"

func (a *App) SaveUserCode(userCode *model.UserNodeCode) error {
	return a.Store.UserCode().Save(userCode)
}

func (a *App) UpdateUserCode(userCode *model.UserNodeCode) error {
	return a.Store.UserCode().Update(userCode)
}

func (a *App) GetUserCodesForNode(userID, nodeID string) ([]*model.UserNodeCode, error) {
	return a.Store.UserCode().GetCodesForUserNode(userID, nodeID)
}

func (a *App) GetUserCodeForNode(userID, nodeID, codeNode string) (*model.UserNodeCode, error) {
	return a.Store.UserCode().GetCodeForUserNode(userID, nodeID, codeNode)
}
