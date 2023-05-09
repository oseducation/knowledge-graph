package api_test

import (
	"testing"

	"github.com/oseducation/knowledge-graph/functionaltesting"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/stretchr/testify/require"
)

func TestUserLogin(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()

	t.Run("can't login with non-existent user", func(t *testing.T) {
		_, resp, err := th.Client.LoginByEmail("bla", "bla")
		require.Error(t, err)
		functionaltesting.CheckUnauthorizedStatus(t, resp)
	})

	t.Run("can't register user without username", func(t *testing.T) {
		user := model.User{
			Email:    "bla@gmail.com",
			Password: "hello1",
		}
		_, resp, err := th.Client.RegisterUser(&user)
		require.Error(t, err)
		functionaltesting.CheckConflictStatus(t, resp) //TODO fix error codes returned by server
	})

	t.Run("can register user", func(t *testing.T) {
		user := model.User{
			Email:         "bla@gmail.com",
			Password:      "hello1",
			EmailVerified: true,
			Username:      "user",
		}
		registeredUser, resp, err := th.Client.RegisterUser(&user)
		require.NoError(t, err)
		functionaltesting.CheckCreatedStatus(t, resp)
		// Creating a user as a regular user with verified flag should not verify the new user.
		require.False(t, registeredUser.EmailVerified)
	})

	t.Run("can register user and log in", func(t *testing.T) {
		user := model.User{
			Email:         "bla3@gmail.com",
			Password:      "hello1",
			EmailVerified: true,
			Username:      "user3",
		}
		registeredUser, resp, err := th.Client.RegisterUser(&user)
		require.NoError(t, err)
		functionaltesting.CheckCreatedStatus(t, resp)

		loggedInUser, resp, err := th.Client.LoginByEmail(user.Email, user.Password)
		require.NoError(t, err)
		functionaltesting.CheckOKStatus(t, resp)
		require.Equal(t, loggedInUser.ID, registeredUser.ID)
	})
}

func TestUserLogout(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()

	t.Run("should logout user", func(t *testing.T) {
		resp, err := th.AdminClient.Logout()
		require.NoError(t, err)
		functionaltesting.CheckOKStatus(t, resp)
		_, resp, err = th.AdminClient.GetUsers()
		require.Error(t, err)
		functionaltesting.CheckUnauthorizedStatus(t, resp)

	})
}

func TestCreateUser(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()

	t.Run("user can't be created without authentication", func(t *testing.T) {
		user := model.User{
			Email:         "bla@gmail.com",
			Password:      "hello1",
			EmailVerified: true,
			Username:      "user",
		}
		_, resp, err := th.Client.CreateUser(&user)
		require.Error(t, err)
		functionaltesting.CheckUnauthorizedStatus(t, resp)
	})

	t.Run("user can't be created by the basic user", func(t *testing.T) {
		user := model.User{
			Email:         "bla@gmail.com",
			Password:      "hello1",
			EmailVerified: true,
			Username:      "user",
		}
		_, resp, err := th.UserClient.CreateUser(&user)
		require.Error(t, err)
		functionaltesting.CheckForbiddenStatus(t, resp)
	})

	t.Run("user can be created by the admin", func(t *testing.T) {
		user := model.User{
			Email:         "bla@gmail.com",
			Password:      "hello1",
			EmailVerified: true,
			Username:      "user",
		}
		_, _, err := th.AdminClient.CreateUser(&user)
		require.NoError(t, err)
	})
}

func TestGetUsers(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()

	t.Run("users can't be retrieved without a authorisation", func(t *testing.T) {
		_, resp, err := th.Client.GetUsers()
		require.Error(t, err)
		functionaltesting.CheckUnauthorizedStatus(t, resp)
	})

	t.Run("users can't be retrieved without a permission", func(t *testing.T) {
		_, resp, err := th.UserClient.GetUsers()
		require.Error(t, err)
		functionaltesting.CheckForbiddenStatus(t, resp)
	})
	t.Run("users can be retrieved with a permission", func(t *testing.T) {

		user := model.User{
			Email:         "bla3@gmail.com",
			Password:      "hello1",
			EmailVerified: true,
			Username:      "user3",
		}
		registeredUser, _, err := th.Client.RegisterUser(&user)
		require.NoError(t, err)
		_, _, err = th.Client.LoginByEmail(user.Email, user.Password)
		require.NoError(t, err)
		retrievedUsers, _, err := th.AdminClient.GetUsers()
		require.NoError(t, err)
		require.Equal(t, (*retrievedUsers)[len(*retrievedUsers)-1].ID, registeredUser.ID)
	})
}

func TestUpdateUser(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()

	t.Run("user can't be updated without authentication", func(t *testing.T) {
		user := model.User{
			Email:         "bla@gmail.com",
			Password:      "hello1",
			EmailVerified: true,
			Username:      "user",
		}
		resp, err := th.Client.UpdateUser(&user)
		require.Error(t, err)
		functionaltesting.CheckUnauthorizedStatus(t, resp)
	})

	t.Run("user can't be updated by the basic user", func(t *testing.T) {
		user := model.User{
			Email:         "bla@gmail.com",
			Password:      "hello1",
			EmailVerified: true,
			Username:      "user",
		}
		_, resp, err := th.UserClient.CreateUser(&user)
		require.Error(t, err)
		functionaltesting.CheckForbiddenStatus(t, resp)
	})

	t.Run("user can be updated by the admin", func(t *testing.T) {
		user := model.User{
			Email:         "bla@gmail.com",
			Password:      "hello1",
			EmailVerified: true,
			Username:      "user",
		}
		createdUser, _, err := th.AdminClient.CreateUser(&user)
		require.NoError(t, err)
		createdUser.FirstName = "UpdatedName"
		resp, err := th.AdminClient.UpdateUser(createdUser)
		require.NoError(t, err)
		functionaltesting.CheckOKStatus(t, resp)
		retrievedUsers, _, err := th.AdminClient.GetUsers()
		require.NoError(t, err)
		require.Equal(t, (*retrievedUsers)[len(*retrievedUsers)-1].FirstName, "UpdatedName")
	})

	t.Run("user email can not be updated", func(t *testing.T) {
		retrievedUsers, _, err := th.AdminClient.GetUsers()
		require.NoError(t, err)
		user := (*retrievedUsers)[len(*retrievedUsers)-1]
		user.Email = "newMail@gmail.com"
		resp, err := th.AdminClient.UpdateUser(&user)
		require.Error(t, err)
		functionaltesting.CheckForbiddenStatus(t, resp)
	})
}

func TestDeleteUser(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()

	t.Run("user can't be deleted without authentication", func(t *testing.T) {
		userID := "123"
		resp, err := th.Client.DeleteUser(userID)
		require.Error(t, err)
		functionaltesting.CheckUnauthorizedStatus(t, resp)
	})

	t.Run("user can't be updated by the basic user", func(t *testing.T) {
		userID := "123"
		resp, err := th.UserClient.DeleteUser(userID)
		require.Error(t, err)
		functionaltesting.CheckForbiddenStatus(t, resp)
	})

	t.Run("user can be deleted by the admin", func(t *testing.T) {
		user := model.User{
			Email:         "bla@gmail.com",
			Password:      "hello1",
			EmailVerified: true,
			Username:      "user",
		}
		createdUser, _, err := th.AdminClient.CreateUser(&user)
		require.NoError(t, err)
		resp, err := th.AdminClient.DeleteUser(createdUser.ID)
		require.NoError(t, err)
		functionaltesting.CheckOKStatus(t, resp)
	})
}

func TestVerifyUserEmail(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()

	t.Run("email can be verified", func(t *testing.T) {
		user := model.User{
			Email:         "bla3@gmail.com",
			Password:      "hello1",
			EmailVerified: true,
			Username:      "user3",
		}
		_, _, err := th.UserClient.RegisterUser(&user)
		require.NoError(t, err)
		tokens, err := th.GetTokensByEmail(user.Email)
		require.NoError(t, err)
		resp, err := th.Client.VerifyUserEmail(tokens[0].Token)
		require.NoError(t, err)
		functionaltesting.CheckOKStatus(t, resp)
	})
	t.Run("email can,t be verified with wrong token", func(t *testing.T) {
		user := model.User{
			Email:         "bla4@gmail.com",
			Password:      "hello1",
			EmailVerified: true,
			Username:      "user4",
		}
		_, _, err := th.UserClient.RegisterUser(&user)
		require.NoError(t, err)
		tokens, err := th.GetTokensByEmail(user.Email)
		require.NoError(t, err)
		resp, err := th.Client.VerifyUserEmail(tokens[0].Token + "random")
		require.Error(t, err)
		functionaltesting.CheckBadRequestStatus(t, resp)
	})
}

func TestSendVerificationEmail(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()
	// For now, we don't send email. So we just check that the request is OK
	t.Run("verification email request should return OK", func(t *testing.T) {
		response, err := th.Client.SendVerificationEmail()
		require.NoError(t, err)
		functionaltesting.CheckOKStatus(t, response)
	})
}
