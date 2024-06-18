package store

import (
	"fmt"

	sq "github.com/Masterminds/squirrel"

	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// UserStore is an interface to crud users
type UserStore interface {
	Save(user *model.User) (*model.User, error)
	SaveOnboardingUser(user *model.UserWithOnboardingState) (*model.UserWithOnboardingState, error)
	Update(new *model.User) error
	UpdateLanguage(userID string, newLanguage string) error
	Get(id string) (*model.User, error)
	GetAll() ([]*model.User, error)
	GetUsers(options *model.UserGetOptions) ([]*model.UserWithNodeCount, error)
	GetByEmail(email string) (*model.User, error)
	Delete(user *model.User) error
	ActiveUsers(nodeID string) ([]*model.User, error)
}

// SQLUserStore is a struct to store users
type SQLUserStore struct {
	sqlStore   *SQLStore
	userSelect sq.SelectBuilder
}

// NewTokenStore creates a new store for tokens.
func NewUserStore(db *SQLStore) UserStore {
	userSelect := db.builder.
		Select(
			"u.id",
			"u.created_at",
			"u.updated_at",
			"u.deleted_at",
			"u.username",
			"u.password",
			"u.first_name",
			"u.last_name",
			"u.email",
			"u.email_verified",
			"u.last_password_update",
			"u.role",
			"u.lang",
		).
		From("users u")

	return &SQLUserStore{
		sqlStore:   db,
		userSelect: userSelect,
	}
}

// Save saves user in the DB
func (us *SQLUserStore) Save(user *model.User) (*model.User, error) {
	if user.ID != "" {
		return nil, errors.New("invalid input")
	}
	user.BeforeSave()
	if err := user.IsValid(); err != nil {
		return nil, err
	}

	_, err := us.sqlStore.execBuilder(us.sqlStore.db, us.sqlStore.builder.
		Insert("users").
		SetMap(map[string]interface{}{
			"id":                   user.ID,
			"created_at":           user.CreatedAt,
			"updated_at":           user.UpdatedAt,
			"deleted_at":           user.DeletedAt,
			"username":             user.Username,
			"password":             user.Password,
			"first_name":           user.FirstName,
			"last_name":            user.LastName,
			"email":                user.Email,
			"email_verified":       user.EmailVerified,
			"last_password_update": user.LastPasswordUpdate,
			"role":                 user.Role,
			"lang":                 user.Lang,
		}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't save user with username:%s and email:%s", user.Username, user.Email)
	}
	return user, nil
}

// SaveOnboardingUser saves onboarding user in the DB
func (us *SQLUserStore) SaveOnboardingUser(user *model.UserWithOnboardingState) (*model.UserWithOnboardingState, error) {
	if user.User.ID != "" {
		return nil, errors.New("invalid input")
	}
	user.User.BeforeSave()
	if err := user.User.IsValid(); err != nil {
		return nil, err
	}

	onboardingState := ""
	var err error
	if user.OnboardingState != nil {
		onboardingState, err = model.ToJSON(user.OnboardingState)
		if err != nil {
			return nil, errors.Wrap(err, "can't marshal onboarding state")
		}
	}
	_, err2 := us.sqlStore.execBuilder(us.sqlStore.db, us.sqlStore.builder.
		Insert("users").
		SetMap(map[string]interface{}{
			"id":                   user.User.ID,
			"created_at":           user.User.CreatedAt,
			"updated_at":           user.User.UpdatedAt,
			"deleted_at":           user.User.DeletedAt,
			"username":             user.User.Username,
			"password":             user.User.Password,
			"first_name":           user.User.FirstName,
			"last_name":            user.User.LastName,
			"email":                user.User.Email,
			"email_verified":       user.User.EmailVerified,
			"last_password_update": user.User.LastPasswordUpdate,
			"role":                 user.User.Role,
			"lang":                 user.User.Lang,
			"onboarding_state":     onboardingState,
		}))
	if err2 != nil {
		return nil, errors.Wrapf(err, "can't save user with username:%s and email:%s", user.User.Username, user.User.Email)
	}
	return user, nil
}

// Update will update user
func (us *SQLUserStore) Update(new *model.User) error {
	new.BeforeUpdate()

	if err := new.IsValid(); err != nil {
		return err
	}

	_, err := us.sqlStore.execBuilder(us.sqlStore.db, us.sqlStore.builder.
		Update("users").
		SetMap(map[string]interface{}{
			"created_at":           new.CreatedAt,
			"updated_at":           new.UpdatedAt,
			"deleted_at":           new.DeletedAt,
			"username":             new.Username,
			"password":             new.Password,
			"first_name":           new.FirstName,
			"last_name":            new.LastName,
			"email":                new.Email,
			"email_verified":       new.EmailVerified,
			"last_password_update": new.LastPasswordUpdate,
			"role":                 new.Role,
			"lang":                 new.Lang,
		}).
		Where(sq.Eq{"ID": new.ID}))
	if err != nil {
		return errors.Wrapf(err, "failed to update user with id '%s'", new.ID)
	}

	return nil
}

// Get returns user by id
func (us *SQLUserStore) Get(id string) (*model.User, error) {
	var user model.User
	if err := us.sqlStore.getBuilder(us.sqlStore.db, &user, us.userSelect.Where(sq.Eq{"u.id": id})); err != nil {
		return nil, errors.Wrapf(err, "can't get user by id: %s", id)
	}
	return &user, nil
}

// GetAll returns all users from database including deleted users
func (us *SQLUserStore) GetAll() ([]*model.User, error) {
	var users []*model.User
	if err := us.sqlStore.selectBuilder(us.sqlStore.db, &users, us.userSelect); err != nil {
		return nil, errors.Wrapf(err, "can't get all the users")
	}
	return users, nil
}

// GetUsers returns all users from database with provided options
func (us *SQLUserStore) GetUsers(options *model.UserGetOptions) ([]*model.UserWithNodeCount, error) {
	var users []*model.UserWithNodeCount
	query := us.userSelect
	if options.WithNodeCount {
		query = us.sqlStore.builder.
			Select(
				"u.id",
				"u.created_at",
				"u.updated_at",
				"u.deleted_at",
				"u.username",
				"u.password",
				"u.first_name",
				"u.last_name",
				"u.email",
				"u.email_verified",
				"u.last_password_update",
				"u.role",
				"u.lang",
				"(Select COUNT(*) from user_nodes where user_nodes.user_id=u.id and user_nodes.status='finished') AS finished_node_count",
				"(Select COUNT(*) from user_nodes where user_nodes.user_id=u.id and (user_nodes.status='started' or user_nodes.status='watched')) AS in_progress_node_count",
			).
			From("users u")
	}
	if options.Term != "" {
		query = query.Where(sq.Like{"u.username": fmt.Sprintf("%%\"%s\"%%", options.Term)})
	}
	if !options.IncludeDeleted {
		query = query.Where("u.deleted_at = 0")
	}
	if options.PerPage > 0 {
		query = query.Limit(uint64(options.PerPage))
	}
	if options.Page >= 0 {
		query = query.Offset(uint64(options.Page * options.PerPage))
	}

	if err := us.sqlStore.selectBuilder(us.sqlStore.db, &users, query); err != nil {
		return nil, errors.Wrapf(err, "can't get users with term %s, page %d, perPage %d", options.Term, options.PerPage, options.PerPage)
	}
	return users, nil
}

// GetByEmail gets user by email
func (us *SQLUserStore) GetByEmail(email string) (*model.User, error) {
	var user model.User
	if err := us.sqlStore.getBuilder(us.sqlStore.db, &user, us.userSelect.Where(sq.Eq{"u.email": email})); err != nil {
		return nil, errors.Wrapf(err, "can't get user by email %s", email)
	}
	return &user, nil
}

// Delete removes user
func (us *SQLUserStore) Delete(user *model.User) error {
	curTime := model.GetMillis()

	_, err := us.sqlStore.execBuilder(us.sqlStore.db, us.sqlStore.builder.
		Update("users").
		SetMap(map[string]interface{}{
			"deleted_at": curTime,
		}).
		Where(sq.Eq{"id": user.ID}))
	if err != nil {
		return errors.Wrapf(err, "failed to delete user with id '%s'", user.ID)
	}

	return nil
}

func (us *SQLUserStore) ActiveUsers(nodeID string) ([]*model.User, error) {
	var users []*model.User

	query := us.userSelect.
		Join("user_nodes un on un.user_id = u.id").
		Where(sq.And{
			sq.Eq{"un.node_id": nodeID},
			sq.Or{
				sq.Eq{"un.status": "started"},
				sq.Eq{"un.status": "watched"},
			},
		})
	if err := us.sqlStore.selectBuilder(us.sqlStore.db, &users, query); err != nil {
		return nil, errors.Wrapf(err, "can't get active users for node %s", nodeID)
	}
	return users, nil
}

// Update will update language for user
func (us *SQLUserStore) UpdateLanguage(userID string, language string) error {
	if language != model.LanguageEnglish && language != model.LanguageGeorgian {
		return errors.Errorf("unknown language - %s", language)
	}

	_, err := us.sqlStore.execBuilder(us.sqlStore.db, us.sqlStore.builder.
		Update("users").
		SetMap(map[string]interface{}{
			"lang": language,
		}).
		Where(sq.Eq{"ID": userID}))
	if err != nil {
		return errors.Wrapf(err, "failed to update language for user with id '%s'", userID)
	}

	return nil
}
