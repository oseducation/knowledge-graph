package store

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// UserCodeStore is an interface to crud users's codes
type UserCodeStore interface {
	Save(userCode *model.UserNodeCode) error
	Update(new *model.UserNodeCode) error
	GetCodesForUserNode(userID, nodeID string) ([]*model.UserNodeCode, error)
	GetCodeForUserNode(userID, nodeID, codeName string) (*model.UserNodeCode, error)
}

// SQLUserCodeStore is a struct to store users's codes
type SQLUserCodeStore struct {
	sqlStore        *SQLStore
	userCodesSelect sq.SelectBuilder
}

// NewUserCodeStore creates a new store for user's codes.
func NewUserCodeStore(db *SQLStore) UserCodeStore {
	userCodesSelect := db.builder.
		Select(
			"uc.user_id",
			"uc.node_id",
			"uc.code_name",
			"uc.code",
		).
		From("user_node_codes uc")

	return &SQLUserCodeStore{
		sqlStore:        db,
		userCodesSelect: userCodesSelect,
	}
}

func (ucs *SQLUserCodeStore) Save(userCode *model.UserNodeCode) error {
	if err := userCode.IsValid(); err != nil {
		return err
	}

	oldCode, err := ucs.GetCodeForUserNode(userCode.UserID, userCode.NodeID, userCode.CodeName)
	if err != nil && oldCode.Code != userCode.Code {
		return ucs.Update(userCode)
	}

	_, err = ucs.sqlStore.execBuilder(ucs.sqlStore.db, ucs.sqlStore.builder.
		Insert("user_node_codes").
		SetMap(map[string]interface{}{
			"user_id":   userCode.UserID,
			"node_id":   userCode.NodeID,
			"code_name": userCode.CodeName,
			"code":      userCode.Code,
		}))
	if err != nil {
		return errors.Wrapf(err, "can't save user node code with code name:%s for user:%s", userCode.CodeName, userCode.UserID)
	}
	return nil
}

func (ucs *SQLUserCodeStore) Update(new *model.UserNodeCode) error {
	if err := new.IsValid(); err != nil {
		return err
	}

	_, err := ucs.sqlStore.execBuilder(ucs.sqlStore.db, ucs.sqlStore.builder.
		Update("user_node_codes").
		SetMap(map[string]interface{}{
			"code": new.Code,
		}).
		Where(sq.And{
			sq.Eq{"user_id": new.UserID},
			sq.Eq{"node_id": new.NodeID},
			sq.Eq{"code_name": new.CodeName},
		}))
	if err != nil {
		return errors.Wrapf(err, "failed to update code for user with id '%s'", new.UserID)
	}

	return nil
}

func (ucs *SQLUserCodeStore) GetCodesForUserNode(userID, nodeID string) ([]*model.UserNodeCode, error) {
	var userCodes []*model.UserNodeCode
	if err := ucs.sqlStore.selectBuilder(ucs.sqlStore.db, &userCodes,
		ucs.userCodesSelect.Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.Eq{"node_id": nodeID},
		})); err != nil {
		return nil, errors.Wrapf(err, "can't get all the codes")
	}
	return userCodes, nil
}

func (ucs *SQLUserCodeStore) GetCodeForUserNode(userID, nodeID, codeName string) (*model.UserNodeCode, error) {
	var userCode model.UserNodeCode
	if err := ucs.sqlStore.getBuilder(ucs.sqlStore.db, &userCode,
		ucs.userCodesSelect.Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.Eq{"node_id": nodeID},
			sq.Eq{"code_name": codeName},
		})); err != nil {
		return nil, errors.Wrapf(err, "can't get code for %s codename", codeName)
	}
	return &userCode, nil
}
