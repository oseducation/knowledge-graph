package commands

import (
	"github.com/oseducation/knowledge-graph/config"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/oseducation/knowledge-graph/store"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
)

var dbCmd = &cobra.Command{
	Use:   "db",
	Short: "Management of Database",
}

var dbCreateAdmin = &cobra.Command{
	Use:     "create",
	Short:   "Create an admin",
	Long:    `Create an admin.`,
	Example: `  db create --email adminEmail --password adminPassword`,
	RunE:    createAdminCmdF,
}

var dbImportGraph = &cobra.Command{
	Use:     "import",
	Short:   "Import graph",
	Long:    `Import Knowledge Graph from files: graph.json, nodes.json, texts.md.`,
	Example: `  db import --url URL-to-folder`,
	RunE:    importGraphCmdF,
}

func init() {
	dbCreateAdmin.Flags().String("email", "", "Admin email")
	dbCreateAdmin.Flags().String("password", "", "Admin password")
	dbCmd.AddCommand(dbCreateAdmin)

	dbImportGraph.Flags().String("url", "", "URL to folder with graph.json file")
	dbCmd.AddCommand(dbImportGraph)

	rootCmd.AddCommand(dbCmd)
}

func createAdminCmdF(command *cobra.Command, _ []string) error {
	email, err := command.Flags().GetString("email")
	if err != nil || email == "" {
		return errors.New("email is required")
	}
	password, err := command.Flags().GetString("password")
	if err != nil || password == "" {
		return errors.New("password is required")
	}

	conf, err := config.ReadConfig()
	if err != nil {
		return errors.Wrap(err, "can't read config")
	}
	db := store.CreateStore(&conf.DBSettings, log.NewLogger(&log.LoggerConfiguration{NonLogger: true}))

	user := &model.User{
		Email:         email,
		EmailVerified: true,
		Password:      password,
		Role:          model.AdminRole,
	}
	_, err = db.User().Save(user)
	if err != nil {
		return errors.Wrap(err, "can't save admin in DB")
	}
	return nil
}

func importGraphCmdF(command *cobra.Command, _ []string) error {
	url, err := command.Flags().GetString("url")
	if err != nil || url == "" {
		return errors.New("url is required")
	}
	srv, err := runServer()
	if err != nil {
		return errors.New("can't run server")
	}
	defer srv.Shutdown()
	if err := srv.App.ImportGraph(url); err != nil {
		return errors.Wrap(err, "can't import graph")
	}
	return nil
}
