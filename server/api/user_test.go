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
	registeredUser, resp, err := th.Client.RegisterUser(&user)
	require.NoError(t, err)
	functionaltesting.CheckCreatedStatus(t, resp)
	// Creating a user as a regular user with verified flag should not verify the new user.
	require.False(t, registeredUser.EmailVerified)

	loggedInUser, resp, err := th.Client.LoginByEmail(user.Email, user.Password)
	require.NoError(t, err)
	functionaltesting.CheckOKStatus(t, resp)
	require.Equal(t, loggedInUser.ID, registeredUser.ID)
}
