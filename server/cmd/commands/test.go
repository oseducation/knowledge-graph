package commands

import (
	"fmt"

	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/services"
	"github.com/oseducation/knowledge-graph/store"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
)

var testCmd = &cobra.Command{
	Use:   "test",
	Short: "test for different things",
}

var testPineconeResponseAdmin = &cobra.Command{
	Use:     "pinecone",
	Short:   "Get pinecone response",
	Long:    `Get pinecone response.`,
	Example: `  test pinecone --text user-input`,
	RunE:    pineconeCmdF,
}

func init() {
	testPineconeResponseAdmin.Flags().String("text", "", "user input")
	testCmd.AddCommand(testPineconeResponseAdmin)

	rootCmd.AddCommand(testCmd)
}

func pineconeCmdF(command *cobra.Command, _ []string) error {
	text, err := command.Flags().GetString("text")
	if err != nil || text == "" {
		return errors.New("text is required")
	}

	services, err := services.NewServices(&store.SQLStore{}, log.NewLogger(&log.LoggerConfiguration{NonLogger: true}))
	if err != nil {
		return errors.Wrap(err, "can't create services")
	}

	vector, err := services.ChatGPTService.GetEmbedding(text, "test-user-id")
	if err != nil {
		return errors.Wrap(err, "can't get embedding")
	}

	topics, err := services.PineconeService.Query(10, vector)
	if err != nil {
		return errors.Wrap(err, "can't get pinecone response")
	}
	println(fmt.Sprintf("pinecone response: \n%v\n\n", topics))
	return nil
}
