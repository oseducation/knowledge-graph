package store

import (
	"github.com/jinzhu/gorm"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// UserStore is an interface to crud users
type UserStore interface {
	Save(user *model.User) (*model.User, error)
	Update(new *model.User) error
	Get(id string) (*model.User, error)
	GetAll() ([]*model.User, error)
	GetUsers(options *model.UserGetOptions) ([]*model.User, error)
	GetByEmail(email string) (*model.User, error)
	Delete(user *model.User) error
}

// SQLUserStore is a struct to store users
type SQLUserStore struct {
	db *gorm.DB
}

// Save saves user in the DB
func (us *SQLUserStore) Save(user *model.User) (*model.User, error) {
	if err := us.db.Create(user).Error; err != nil {
		return nil, errors.Wrap(err, "can't save user")
	}
	return user, nil
}

// Update will update user
func (us *SQLUserStore) Update(new *model.User) error {
	if err := us.db.Save(new).Error; err != nil {
		return errors.Wrap(err, "can't update user")
	}
	return nil
}

// Get returns user by id
func (us *SQLUserStore) Get(id string) (*model.User, error) {
	var user model.User
	if err := us.db.First(&user, "ID = ?", id).Error; err != nil {
		return nil, errors.Wrapf(err, "can't get user by id: %s", id)
	}
	return &user, nil
}

// GetAll returns all users from database
func (us *SQLUserStore) GetAll() ([]*model.User, error) {
	var users []*model.User
	if err := us.db.Find(&users).Error; err != nil {
		return nil, errors.Wrap(err, "can't get all the users")
	}
	return users, nil
}

// GetUsers returns all users from database with provided options
func (us *SQLUserStore) GetUsers(options *model.UserGetOptions) ([]*model.User, error) {
	var users []*model.User
	if err := us.db.Where("Email LIKE ?", "%"+options.Term+"%").
		Limit(options.PerPage).
		Offset(options.Page).
		Find(&users).
		Error; err != nil {
		return nil, errors.Wrapf(err, "can't get users with term %s, page %d, perPage %d", options.Term, options.PerPage, options.PerPage)
	}
	return users, nil
}

// GetByEmail gets user by email
func (us *SQLUserStore) GetByEmail(email string) (*model.User, error) {
	var user model.User
	if err := us.db.Where("Email = ?", email).First(&user).Error; err != nil {
		return nil, errors.Wrap(err, "can't get user by email")
	}
	return &user, nil
}

// Delete removes user
func (us *SQLUserStore) Delete(user *model.User) error {
	if err := us.db.Delete(user).Error; err != nil {
		return errors.Wrap(err, "can't delete user")
	}
	return nil
}
