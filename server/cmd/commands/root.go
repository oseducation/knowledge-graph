package commands

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/server"
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

func serverCmdF(command *cobra.Command, args []string) error {
	config := &log.LoggerConfiguration{
		EnableConsole: true,
		ConsoleJSON:   true,
		ConsoleLevel:  "debug",
		EnableFile:    true,
		FileJSON:      true,
		FileLevel:     "debug",
		FileLocation:  "server.log",
	}
	logger := log.NewLogger(config)
	srv, err := server.NewServer(logger)
	if err != nil {
		logger.Error(err.Error())
		return err
	}
	defer srv.Shutdown()

	serverErr := srv.Start()
	if serverErr != nil {
		logger.Error(err.Error())
		return serverErr
	}

	// wait for kill signal before attempting to gracefully shutdown
	// the running service
	interruptChan := make(chan os.Signal, 1)
	signal.Notify(interruptChan, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	<-interruptChan
	return nil
}
