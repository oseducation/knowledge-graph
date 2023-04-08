package api_test

import (
	"testing"

	"github.com/oseducation/knowledge-graph/functionaltesting"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/stretchr/testify/require"
)

func TestCreateNode(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()

	node := model.Node{
		Name:        "bla",
		Description: "bla",
	}
	_, resp, err := th.Client.CreateNode(&node)
	require.NotNil(t, err)
	functionaltesting.CheckUnauthorizedStatus(t, resp)

	nodes, resp, err := th.Client.GetNodes(0, 100, "")
	require.Len(t, nodes, 0)
}
