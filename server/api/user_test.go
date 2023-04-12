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
