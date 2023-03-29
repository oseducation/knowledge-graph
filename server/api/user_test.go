package api_test

import (
	"testing"

	"github.com/oseducation/knowledge-graph/functionaltesting"
	"github.com/stretchr/testify/require"
)

func TestCreateUser(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()

	_, resp, err := th.Client.LoginByEmail("bla", "bla")
	require.NotNil(t, err)
	functionaltesting.CheckUnauthorizedStatus(t, resp)

	// user := model.User{
	// 	Email:    "bla@gmail.com",
	// 	Password: "hello1",

	// 	EmailVerified: true,
	// }
	// ruser, resp, err := th.Client.CreateUser(&user)
	// require.NoError(t, err)
	// functionaltesting.CheckCreatedStatus(t, resp)

	// // Creating a user as a regular user with verified flag should not verify the new user.
	// require.False(t, ruser.EmailVerified)
}
