package functionaltesting

import (
	"net/http"
	"testing"

	"github.com/oseducation/knowledge-graph/config"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/server"
	"github.com/stretchr/testify/require"
)

type TestHelper struct {
	Server *server.Server
	config *config.Config

	Client *Client
}

func getTestConfig() *config.Config {
	config := &config.Config{}
	config.DBSettings.DriverName = "sqlite3"
	config.DBSettings.DataSource = "../sqlite-test.db"
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
		Server: server,
		config: config,
		Client: NewClient("http://localhost:9081/"),
	}
	return th
}

func (th *TestHelper) TearDown() {
	th.Server.Shutdown()
}

func CheckCreatedStatus(tb testing.TB, resp *Response) {
	tb.Helper()
	checkHTTPStatus(tb, resp, http.StatusCreated)
}

func CheckUnauthorizedStatus(tb testing.TB, resp *Response) {
	tb.Helper()
	checkHTTPStatus(tb, resp, http.StatusUnauthorized)
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
