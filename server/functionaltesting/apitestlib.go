package functionaltesting

import (
	"net/http"
	"os"
	"testing"

	"github.com/oseducation/knowledge-graph/app"
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
	cfg := &config.Config{}
	cfg.DBSettings.DriverName = "sqlite3"
	cfg.DBSettings.DataSource = "../sqlite-test.db"
	cfg.EmailSettings.RequireEmailVerification = true
	cfg.ServerSettings.SessionLengthInMinutes = 7200
	cfg.ServerSettings.ExtendSessionLengthWithActivity = true
	cfg.ServerSettings.SessionIdleTimeoutInMinutes = 3600
	cfg.ServerSettings.CookieDomain = ""
	return cfg
}

func Setup(tb testing.TB) *TestHelper {
	if testing.Short() {
		tb.SkipNow()
	}

	cfg := getTestConfig()
	logger := log.NewLogger(&log.LoggerConfiguration{NonLogger: true})
	newServer, err := server.NewServer(logger, cfg)
	if err != nil {
		panic(err)
	}
	newServer.Config = cfg

	// TODO do the proper mocking of the youtube service
	os.Setenv(app.YoutubeAPIKey, "YoutubeAPIKey")

	err = newServer.Start()
	if err != nil {
		panic(err)
	}
	newServer.App.Store.EmptyAllTables()

	th := &TestHelper{
		Server:      newServer,
		config:      cfg,
		Client:      NewClient("http://localhost:9081/"),
		UserClient:  NewClient("http://localhost:9081/"),
		AdminClient: NewClient("http://localhost:9081/"),
	}
	th.Init()
	return th
}

func SetupWithInvalidJSON(tb testing.TB) *TestHelper {
	th := Setup(tb)
	th.Client.UseInvalidJSON = true
	th.UserClient.UseInvalidJSON = true
	th.AdminClient.UseInvalidJSON = true
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
