package commands

import (
	"encoding/json"
	"strings"

	"github.com/oseducation/knowledge-graph/app"
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
	Use:     "import-old",
	Short:   "Import graph",
	Long:    `Import Knowledge Graph from files: graph.json, nodes.json, texts.md.`,
	Example: `  db import-old --url URL-to-folder`,
	RunE:    importGraphCmdF,
}

var dbImportContent = &cobra.Command{
	Use:     "import-content",
	Short:   "Import content",
	Long:    `Import Knowledge Graph Content from files: graph.json, nodes.json, texts.md.`,
	Example: `  db import-content --url URL-to-folder`,
	RunE:    importAllContentCmdF,
}

var dbAddNode = &cobra.Command{
	Use:     "add-node",
	Short:   "Add a single node",
	Long:    `Add a single node with node details, prerequisites and post-requisites`,
	Example: `  db add-node --node '{node json}' --pre '[list of prerequisites]' --post '[list of post-requisites]'`,
	RunE:    addNodeCmdF,
}

var dbNuke = &cobra.Command{
	Use:     "nuke",
	Short:   "Nuke DB",
	Long:    `Remove all data from the DB`,
	Example: `  db nuke `,
	RunE:    nukeDB,
}

func init() {
	dbCreateAdmin.Flags().String("email", "", "Admin email")
	dbCreateAdmin.Flags().String("password", "", "Admin password")
	dbCmd.AddCommand(dbCreateAdmin)

	dbImportGraph.Flags().String("url", "", "URL to folder with graph.json file")
	dbCmd.AddCommand(dbImportGraph)

	dbImportContent.Flags().String("url", "", "URL to folder with graph.json file")
	dbCmd.AddCommand(dbImportContent)

	dbAddNode.Flags().String("node", "", "a string in json format with node data")
	dbAddNode.Flags().String("pre", "", "a list in json format with prerequisite node names")
	dbAddNode.Flags().String("post", "", "a list in json format with post-requisite node names")
	dbAddNode.Flags().String("author", "", "an authorID of the node")
	dbCmd.AddCommand(dbAddNode)

	dbCmd.AddCommand(dbNuke)

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

func nukeDB(_ *cobra.Command, _ []string) error {
	conf, err := config.ReadConfig()
	if err != nil {
		return errors.Wrap(err, "can't read config")
	}
	db := store.CreateStore(&conf.DBSettings, log.NewLogger(&log.LoggerConfiguration{NonLogger: true}))
	if err := db.Nuke(); err != nil {
		return errors.Wrap(err, "can't nuke DB")
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
	password, err := srv.App.ImportGraphOld(url)
	if err != nil {
		return errors.Wrap(err, "can't import graph")
	}
	println("password", password)
	return nil
}

func importAllContentCmdF(command *cobra.Command, _ []string) error {
	url, err := command.Flags().GetString("url")
	if err != nil || url == "" {
		return errors.New("url is required")
	}
	srv, err := runServer()
	if err != nil {
		return errors.New("can't run server")
	}
	defer srv.Shutdown()
	password, err := srv.App.ImportAllContent(url)
	if err != nil {
		return errors.Wrap(err, "can't import all the content")
	}
	println("password", password)
	return nil
}

func addNodeCmdF(command *cobra.Command, _ []string) error {
	nodeJSON, err := command.Flags().GetString("node")
	if err != nil || nodeJSON == "" {
		return errors.New("node json is required")
	}

	var node app.NodeWithKey
	if err2 := json.Unmarshal([]byte(nodeJSON), &node); err2 != nil {
		return errors.Wrap(err, "can't unmarshal nodeJSON")
	}

	prerequisiteJSON, err := command.Flags().GetString("pre")
	if err != nil || prerequisiteJSON == "" {
		return errors.New("prerequisite json is required")
	}
	var prerequisites []string
	if err2 := json.Unmarshal([]byte(prerequisiteJSON), &prerequisites); err2 != nil {
		return errors.Wrap(err2, "can't unmarshal prerequisites' json")
	}

	postRequisiteJSON, err := command.Flags().GetString("post")
	if err != nil || postRequisiteJSON == "" {
		return errors.New("post-requisite json is required")
	}
	var postRequisites []string
	if err2 := json.Unmarshal([]byte(postRequisiteJSON), &postRequisites); err2 != nil {
		return errors.Wrap(err2, "can't unmarshal post-requisites' json")
	}

	authorID, err := command.Flags().GetString("author")
	if err != nil || authorID == "" {
		return errors.New("author json is required")
	}

	srv, err := runServer()
	if err != nil {
		return errors.New("can't run server")
	}
	defer srv.Shutdown()

	updatedNode, err := srv.App.Store.Node().Save(&node.Node)
	if err != nil {
		return errors.Wrap(err, "can't save node to db")
	}

	title, duration, err := srv.App.Services.YoutubeService.GetYoutubeVideoInfo(node.Key)
	if err != nil {
		return errors.Wrapf(err, "can't get youtube video info %s", node.Key)
	}

	video := model.Video{
		Name:      title,
		VideoType: model.YouTubeVideoType,
		Key:       node.Key,
		NodeID:    updatedNode.ID,
		Length:    duration,
		AuthorID:  authorID,
	}

	if _, err := srv.App.Store.Video().Save(&video); err != nil && !strings.Contains(strings.ToLower(err.Error()), "unique constraint") {
		return errors.Wrap(err, "can't save video")
	}

	for _, prereq := range prerequisites {
		prereqNode, err := srv.App.Store.Node().GetByName(prereq)
		if err != nil {
			return errors.Wrapf(err, "no prereq - %s node in db", prereq)
		}
		if err := srv.App.Store.Graph().Save(&model.Edge{
			FromNodeID: prereqNode.ID,
			ToNodeID:   updatedNode.ID,
		}); err != nil {
			return errors.Wrap(err, "can't save prereq edge")
		}
	}

	for _, postReq := range postRequisites {
		postReqNode, err := srv.App.Store.Node().GetByName(postReq)
		if err != nil {
			return errors.Wrapf(err, "no postReq - %s node in db", postReq)
		}
		if err := srv.App.Store.Graph().Save(&model.Edge{
			FromNodeID: updatedNode.ID,
			ToNodeID:   postReqNode.ID,
		}); err != nil {
			return errors.Wrap(err, "can't save postreq edge")
		}
	}
	return nil
}
