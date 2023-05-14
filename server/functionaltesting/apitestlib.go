package functionaltesting

import (
	"net/http"
	"testing"

	"github.com/oseducation/knowledge-graph/config"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/oseducation/knowledge-graph/server"
	"github.com/stretchr/testify/require"
)

type TestHelper struct {
	Server *server.Server
	config *config.Config

	Client      *Client // client with no user logged in
	AdminClient *Client // client with admin logged in
	UserClient  *Client // client with basic user logged in

	AdminUser *model.User
	BasicUser *model.User
}

func getTestConfig() *config.Config {
	config := &config.Config{}
	config.DBSettings.DriverName = "sqlite3"
	config.DBSettings.DataSource = "../sqlite-test.db"
	config.EmailSettings.RequireEmailVerification = true
	config.ServerSettings.SessionLengthInMinutes = 7200
	config.ServerSettings.ExtendSessionLengthWithActivity = true
	config.ServerSettings.SessionIdleTimeoutInMinutes = 3600
	return config
}

func Setup(tb testing.TB) *TestHelper {
	if testing.Short() {
		tb.SkipNow()
	}

	config := getTestConfig()
	logger := log.NewLogger(&log.LoggerConfiguration{NonLogger: true})
	server, err := server.NewServer(logger, config)
	if err != nil {
		panic(err)
	}
	server.Config = config
	err = server.Start()
	if err != nil {
		panic(err)
	}
	server.App.Store.EmptyAllTables()

	th := &TestHelper{
		Server:      server,
		config:      config,
		Client:      NewClient("http://localhost:9081/"),
		UserClient:  NewClient("http://localhost:9081/"),
		AdminClient: NewClient("http://localhost:9081/"),
	}
	th.Init()
	return th
}

func (th *TestHelper) Init() {
	id := model.NewID()
	admin := &model.User{
		Email:     "admin@someRandomEmail.com",
		Username:  "CoolAdmin",
		FirstName: "f_" + id,
		LastName:  "l_" + id,
		Password:  "Pa$$word11",
	}

	admin, _, err := th.Client.RegisterUser(admin)
	if err != nil {
		panic(err)
	}

	admin.Role = model.AdminRole
	if err2 := th.Server.App.UpdateUser(admin); err2 != nil {
		panic(err2)
	}
	admin.Password = "Pa$$word11"
	th.AdminUser = admin

	_, _, err = th.AdminClient.LoginByEmail(th.AdminUser.Email, th.AdminUser.Password)
	if err != nil {
		panic(err)
	}

	id = model.NewID()
	user := &model.User{
		Email:     "basic_user@someRandomEmail.com",
		Username:  "BasicUser",
		FirstName: "f_" + id,
		LastName:  "l_" + id,
		Password:  "Pa$$word11",
	}
	user, _, err = th.Client.RegisterUser(user)
	if err != nil {
		panic(err)
	}

	user.Password = "Pa$$word11"
	th.BasicUser = user

	_, _, err = th.UserClient.LoginByEmail(th.BasicUser.Email, th.BasicUser.Password)
	if err != nil {
		panic(err)
	}
}

func (th *TestHelper) TearDown() {
	th.Server.Shutdown()
}

func (th *TestHelper) GetTokensByEmail(email string) ([]*model.Token, error) {
	return th.Server.App.Store.Token().GetTokenByEmail(email)
}

func CheckCreatedStatus(tb testing.TB, resp *Response) {
	tb.Helper()
	checkHTTPStatus(tb, resp, http.StatusCreated)
}

func CheckUnauthorizedStatus(tb testing.TB, resp *Response) {
	tb.Helper()
	checkHTTPStatus(tb, resp, http.StatusUnauthorized)
}

func CheckForbiddenStatus(tb testing.TB, resp *Response) {
	tb.Helper()
	checkHTTPStatus(tb, resp, http.StatusForbidden)
}

func CheckBadRequestStatus(tb testing.TB, resp *Response) {
	tb.Helper()
	checkHTTPStatus(tb, resp, http.StatusBadRequest)
}

func CheckConflictStatus(tb testing.TB, resp *Response) {
	tb.Helper()
	checkHTTPStatus(tb, resp, http.StatusConflict)
}

func CheckOKStatus(tb testing.TB, resp *Response) {
	tb.Helper()
	checkHTTPStatus(tb, resp, http.StatusOK)
}

func checkHTTPStatus(tb testing.TB, resp *Response, expectedStatus int) {
	tb.Helper()

	require.NotNilf(tb, resp, "Unexpected nil response, expected http status:%v", expectedStatus)
	require.Equalf(tb, expectedStatus, resp.StatusCode, "Expected http status:%v, got %v", expectedStatus, resp.StatusCode)
}
