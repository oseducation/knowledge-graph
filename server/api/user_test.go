package api_test

import (
	"testing"

	"github.com/oseducation/knowledge-graph/functionaltesting"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/stretchr/testify/require"
)

func TestCreateUser(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()

	_, resp, err := th.Client.LoginByEmail("bla", "bla")
	require.NotNil(t, err)
	functionaltesting.CheckUnauthorizedStatus(t, resp)

	user := model.User{
		Email:         "bla@gmail.com",
		Password:      "hello1",
		EmailVerified: true,
	}
	_, _, err = th.Client.RegisterUser(&user)
	require.NotNil(t, err)

	user.Username = "user"
	registeredUser, resp, err := th.Client.RegisterUser(&user)
	require.NoError(t, err)
	functionaltesting.CheckCreatedStatus(t, resp)
	// Creating a user as a regular user with verified flag should not verify the new user.
	require.False(t, registeredUser.EmailVerified)

	loggedInUser, resp, err := th.Client.LoginByEmail(user.Email, user.Password)
	require.NoError(t, err)
	functionaltesting.CheckOKStatus(t, resp)
	require.Equal(t, loggedInUser.ID, registeredUser.ID)

	newUser := model.User{
		Email:    "bla2@gmail.com",
		Password: "hello1",
		Username: "bla2",
	}
	_, resp, err = th.Client.CreateUser(&newUser)
	require.NotNil(t, err)
	functionaltesting.CheckForbiddenStatus(t, resp)

	registeredUser.Role = model.AdminRole
	err = th.Server.App.UpdateUser(registeredUser)
	require.Nil(t, err)

	_, resp, err = th.Client.CreateUser(&newUser)
	require.Nil(t, err)
}
