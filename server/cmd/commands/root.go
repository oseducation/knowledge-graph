package commands

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/oseducation/knowledge-graph/config"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/server"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
)

// Command is an abstraction of the cobra Command
type Command = cobra.Command

// Run function starts the application
func Run(args []string) error {
	rootCmd.SetArgs(args)
	return rootCmd.Execute()
}

// rootCmd is a command to run the server.
var rootCmd = &cobra.Command{
	Use:   "server",
	Short: "Runs a server",
	Long:  `Runs a server. Killing the process will stop the server`,
	RunE:  serverCmdF,
}

func serverCmdF(_ *cobra.Command, _ []string) error {
	srv, err := runServer()
	if err != nil {
		return err
	}
	defer srv.Shutdown()

	// wait for kill signal before attempting to gracefully shutdown
	// the running service
	interruptChan := make(chan os.Signal, 1)
	signal.Notify(interruptChan, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	<-interruptChan
	return nil
}

func runServer() (*server.Server, error) {
	logConfig := &log.LoggerConfiguration{
		EnableConsole: true,
		ConsoleJSON:   true,
		ConsoleLevel:  "debug",
		EnableFile:    true,
		FileJSON:      true,
		FileLevel:     "debug",
		FileLocation:  "server.log",
	}
	logger := log.NewLogger(logConfig)
	conf, err := config.ReadConfig()
	if err != nil {
		return nil, errors.Wrap(err, "can't read config")
	}
	srv, err := server.NewServer(logger, conf)
	if err != nil {
		logger.Error(err.Error())
		return nil, err
	}

	serverErr := srv.Start()
	if serverErr != nil {
		logger.Error(serverErr.Error())
		return nil, serverErr
	}
	return srv, nil
}
