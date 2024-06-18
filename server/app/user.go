package app

import (
	"encoding/json"
	"fmt"

	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

// AuthenticateUser authenticates user for login
func (a *App) AuthenticateUser(email, password string) (*model.User, error) {
	user, err := a.Store.User().GetByEmail(email)
	if err != nil {
		return nil, errors.Wrap(err, "can't authenticate user")
	}
	if !user.ComparePassword(password) {
		return nil, errors.New("Wrong Password")
	}
	user.Sanitize()
	return user, nil
}

// CreateUserFromSignUp creates user on sign up
func (a *App) CreateUserFromSignUp(userWithOnboardingState *model.UserWithOnboardingState) (*model.UserWithOnboardingState, error) {
	userWithOnboardingState.User.Role = model.UserRole
	userWithOnboardingState.User.EmailVerified = false
	ruser, err := a.Store.User().SaveOnboardingUser(userWithOnboardingState)
	if err != nil {
		return nil, errors.Wrapf(err, "useremail = %s", userWithOnboardingState.User.Email)
	}
	if err := a.populateUserKnowledge(userWithOnboardingState.OnboardingState.Answers, ruser.User.ID); err != nil {
		a.Log.Error("Failed to populate user's knowledge", log.String("answers", fmt.Sprintf("%v", userWithOnboardingState.OnboardingState.Answers)), log.Err(err))
	}

	if err := a.sendWelcomeEmail(ruser.User.ID, ruser.User.Email, ruser.User.EmailVerified); err != nil {
		a.Log.Error("Failed to send welcome email on create user from signup", log.Err(err))
	}
	return userWithOnboardingState, nil
}

// GetUsers gets users, filters usernames with 'term'
func (a *App) GetUsers(options *model.UserGetOptions) ([]*model.UserWithNodeCount, error) {
	users, err := a.Store.User().GetUsers(options)
	if err != nil {
		return nil, errors.Wrapf(err, "options = %v", options)
	}
	return a.sanitizeUsersWithNodeCounts(users), nil
}

// GetUser gets user with id
func (a *App) GetUser(userID string) (*model.User, error) {
	user, err := a.Store.User().Get(userID)
	if err != nil {
		return nil, errors.Wrapf(err, "can't get userID = %v", userID)
	}
	return user, nil
}

// GetUser gets user with id
func (a *App) IsActiveCustomer(userID string) (bool, error) {
	isActive, err := a.Store.Customer().IsActiveCustomer(userID)
	if err != nil {
		return false, errors.Wrapf(err, "can't get userID = %v", userID)
	}
	return isActive, nil
}

// CreateUser creates new user
func (a *App) CreateUser(user *model.User) (*model.User, error) {
	user.EmailVerified = false
	ruser, err := a.Store.User().Save(user)
	if err != nil {
		return nil, errors.Wrapf(err, "userID = %s", user.ID)
	}
	if err := a.sendWelcomeEmail(ruser.ID, ruser.Email, ruser.EmailVerified); err != nil {
		a.Log.Error("Failed to send welcome email on create user", log.Err(err))
	}
	return ruser, nil
}

// UpdateUser updates user
func (a *App) UpdateUser(user *model.User) error {
	if err := a.Store.User().Update(user); err != nil {
		return errors.Wrapf(err, "user = %s", user.ID)
	}
	return nil
}

// DeleteUser deletes user
func (a *App) DeleteUser(user *model.User) error {
	if err := a.Store.User().Delete(user); err != nil {
		return errors.Wrapf(err, "user = %s", user.ID)
	}
	return nil
}

func (a *App) UpdatePasswordAsUser(userID, currentPassword, newPassword string) error {
	user, err := a.GetUser(userID)
	if err != nil {
		return err
	}
	if !user.ComparePassword(currentPassword) {
		return errors.New("Wrong Password")
	}

	return a.UpdatePassword(user, newPassword)
}

func (a *App) sanitizeUsers(users []*model.User) []*model.User {
	for _, u := range users {
		u.Sanitize()
	}
	return users
}

func (a *App) sanitizeUsersWithNodeCounts(users []*model.UserWithNodeCount) []*model.UserWithNodeCount {
	for _, u := range users {
		u.Sanitize()
	}
	return users
}

func (a *App) UpdatePassword(user *model.User, newPassword string) error {
	user.UpdatePassword(newPassword)
	if err := a.Store.User().Update(user); err != nil {
		return errors.Wrapf(err, "user = %s", user.ID)
	}
	return nil
}

func (a *App) SendResetPassword(email string) error {
	user, err := a.Store.User().GetByEmail(email)
	if err != nil {
		return errors.Wrap(err, "can't get user")
	}

	tokenExtra := struct {
		UserID string
		Email  string
	}{
		user.ID,
		email,
	}
	jsonData, err := json.Marshal(tokenExtra)
	if err != nil {
		return errors.Wrapf(err, "can't password recovery token for user - %s with email - %s", user.ID, email)
	}

	token := model.NewToken(model.TokenTypePasswordRecovery, string(jsonData))

	err = a.Store.Token().Save(token)
	if err != nil {
		return err
	}

	if err := a.SendPasswordResetEmail(user.Email, token.Token); err != nil {
		return errors.Wrap(err, "can't send password reset email")
	}

	return nil
}

func (a *App) ResetPasswordFromToken(tokenString, newPassword string) error {
	token, err := a.Store.Token().Get(tokenString)
	if err != nil {
		return errors.Wrap(err, "can't get token")
	}

	if model.GetMillis()-token.CreatedAt >= model.PasswordRecoverExpiryTime {
		return errors.New("token is expired")
	}

	tokenData := struct {
		UserID string
		Email  string
	}{}

	err2 := json.Unmarshal([]byte(token.Extra), &tokenData)
	if err2 != nil {
		return errors.New("error in token extra data")
	}

	user, err := a.GetUser(tokenData.UserID)
	if err != nil {
		return err
	}

	if user.Email != tokenData.Email {
		return errors.New("email mismatch")
	}

	if err := a.UpdatePassword(user, newPassword); err != nil {
		return errors.Wrap(err, "can't update password")
	}

	if err := a.Store.Token().Delete(tokenString); err != nil {
		a.Log.Warn("Failed to delete token", log.Err(err))
	}
	return nil
}
