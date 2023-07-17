package api_test

import (
	"strconv"
	"testing"

	"github.com/oseducation/knowledge-graph/functionaltesting"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/stretchr/testify/require"
)

var testNode = model.Node{
	Name:        "test node name",
	Description: "test node description",
	NodeType:    "example",
}
var invalidNode = model.Node{}

func TestCreateNode(t *testing.T) {

	th := functionaltesting.Setup(t)
	defer th.TearDown()

	t.Run("can create node", func(t *testing.T) {
		node := testNode
		//node.ID = testNodeId
		createdNode, resp, err := th.AdminClient.CreateNode(&node)
		require.NoError(t, err)
		functionaltesting.CheckCreatedStatus(t, resp)
		createdNode.Name = node.Name
		createdNode.Description = node.Description
		createdNode.NodeType = node.NodeType

	})

	t.Run("can't create node with missing data", func(t *testing.T) {
		node := invalidNode
		_, resp, err := th.AdminClient.CreateNode(&node)
		require.Error(t, err)
		functionaltesting.CheckBadRequestStatus(t, resp)
	})
}
func TestCreateNodeInvalidJSON(t *testing.T) {
	th := functionaltesting.SetupWithInvalidJSON(t)
	defer th.TearDown()
	t.Run("can not create node with invalid json", func(t *testing.T) {
		node := testNode
		_, resp, err := th.AdminClient.CreateNode(&node)
		require.Error(t, err)
		functionaltesting.CheckBadRequestStatus(t, resp)
	})
}

func TestGetNodes(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()

	t.Run("can get nodes when nodes are empty", func(t *testing.T) {
		nodes, resp, err := th.AdminClient.GetNodes(0, 2, "", "", "")
		require.NoError(t, err)
		functionaltesting.CheckOKStatus(t, resp)
		require.Truef(t, len(nodes) == 0, "nodes = %v", nodes)
	})

	t.Run("can get nodes when nods exist", func(t *testing.T) {
		node := testNode
		node.Name = "Node1"
		_, _, err := th.AdminClient.CreateNode(&node)
		node.Name = "Node2"
		_, _, err = th.AdminClient.CreateNode(&node)
		require.NoError(t, err)

		nodes, _, err2 := th.AdminClient.GetNodes(0, 2, "Node1", "", "")
		require.NoError(t, err2)
		require.Truef(t, len(nodes) == 1, "nodes = %v", nodes)

	})

}
func TestGetNodesWhenNodesExist(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()
	node := testNode
	node.Name = "Node1"
	node.Description = "Description1"
	_, _, err := th.AdminClient.CreateNode(&node)
	node.Name = "Node2"
	node.Description = "Description2"
	_, _, err = th.AdminClient.CreateNode(&node)
	require.NoError(t, err)

	t.Run("can get nodes when nods exist", func(t *testing.T) {
		nodes, _, err := th.AdminClient.GetNodes(0, 2, "Node1", "", "")
		require.NoError(t, err)
		require.Truef(t, len(nodes) == 1, "nodes = %v", nodes)
	})
	t.Run("can get nodes when nods exist", func(t *testing.T) {
		nodes, _, err := th.AdminClient.GetNodes(0, 2, "", "Description2", "")
		require.NoError(t, err)
		require.Truef(t, len(nodes) == 1, "nodes = %v", nodes)
	})
	t.Run("can get nodes when nods exist", func(t *testing.T) {
		nodes, _, err := th.AdminClient.GetNodes(0, 2, "Node1", "Description2", "")
		require.NoError(t, err)
		require.Truef(t, len(nodes) == 0, "nodes = %v", nodes)
	})
	t.Run("can get nodes when nods exist", func(t *testing.T) {
		nodes, _, err := th.AdminClient.GetNodes(0, 2, "", "", "")
		require.NoError(t, err)
		require.Truef(t, len(nodes) == 2, "nodes = %v", nodes)
	})

}

func TestUpdateNode(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()
	node := testNode
	node.Name = "Node1"
	node.Description = "Description1"
	createdNode, resp, err := th.AdminClient.CreateNode(&node)
	require.NoError(t, err)
	functionaltesting.CheckCreatedStatus(t, resp)
	t.Run("can update node", func(t *testing.T) {
		createdNode.Name = "Node2"
		resp, err := th.AdminClient.UpdateNode(createdNode)
		require.NoError(t, err)
		functionaltesting.CheckOKStatus(t, resp)
		updatedNode, resp2, err2 := th.AdminClient.GetNodes(0, 1, "Node2", "", "")
		require.NoError(t, err2)
		functionaltesting.CheckOKStatus(t, resp2)
		require.Truef(t, len(updatedNode) == 1, "nodes = %v", updatedNode)
		require.Truef(t, updatedNode[0].Name == "Node2", "nodes = %v", updatedNode)
	})

	t.Run("can't update non-existent node", func(t *testing.T) {
		node := testNode
		node.ID = "nonexistentnodeid"
		resp, err := th.AdminClient.UpdateNode(&node)
		require.Error(t, err)
		functionaltesting.CheckBadRequestStatus(t, resp)
	})
}

func TestUpdateNodeInvalidJson(t *testing.T) {
	th := functionaltesting.SetupWithInvalidJSON(t)
	defer th.TearDown()
	t.Run("can not update node with invalid json", func(t *testing.T) {
		node := testNode
		//node.ID = testNodeId
		_, resp, err := th.AdminClient.CreateNode(&node)
		require.Error(t, err)
		functionaltesting.CheckBadRequestStatus(t, resp)
	})
}

func TestDeleteNode(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()
	node := testNode
	node.Name = "Node1"
	node.Description = "Description1"
	createdNode, resp, err := th.AdminClient.CreateNode(&node)
	require.NoError(t, err)
	functionaltesting.CheckCreatedStatus(t, resp)
	node.Name = "Node2"
	node.Description = "Description2"
	createdNode2, resp2, err2 := th.AdminClient.CreateNode(&node)
	require.NoError(t, err2)
	functionaltesting.CheckCreatedStatus(t, resp2)
	t.Run("can delete node", func(t *testing.T) {
		resp, err := th.AdminClient.DeleteNode(createdNode.ID)
		require.NoError(t, err)
		functionaltesting.CheckOKStatus(t, resp)
		deletedNode, rest, err2 := th.AdminClient.GetNode(createdNode.ID)
		require.NoError(t, err2)
		functionaltesting.CheckOKStatus(t, rest)
		require.Truef(t, deletedNode.DeletedAt > 0, "node = %v", deletedNode)
	})

	t.Run("should not  delete node twice", func(t *testing.T) {
		resp, err := th.AdminClient.DeleteNode(createdNode2.ID)
		require.NoError(t, err)
		functionaltesting.CheckOKStatus(t, resp)

		resp, err = th.AdminClient.DeleteNode(createdNode2.ID)
		require.NoError(t, err)
		functionaltesting.CheckOKStatus(t, resp)
	})
	t.Run("can not delete non existing node", func(t *testing.T) {
		resp, err := th.AdminClient.DeleteNode("someInvalidID")
		require.Error(t, err)
		functionaltesting.CheckBadRequestStatus(t, resp)
	})
}

func TestGetNode(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()
	node := testNode
	node.Name = "Node1"
	node.Description = "Description1"
	createdNode, resp, err := th.AdminClient.CreateNode(&node)
	require.NoError(t, err)
	functionaltesting.CheckCreatedStatus(t, resp)
	t.Run("can get node", func(t *testing.T) {
		node, resp, err := th.AdminClient.GetNode(createdNode.ID)
		require.NoError(t, err)
		functionaltesting.CheckOKStatus(t, resp)
		require.Truef(t, node.Name == "Node1", "node = %v", node)
	})

	t.Run("can't get node with invalid node_id", func(t *testing.T) {
		_, resp, err := th.AdminClient.GetNode("invalidnodeid")
		require.Error(t, err)
		functionaltesting.CheckBadRequestStatus(t, resp)
	})
}

func TestGetNodesWithPagination(t *testing.T) {
	th := functionaltesting.Setup(t)
	defer th.TearDown()

	// Create a large number of nodes
	for i := 0; i < 50; i++ {
		node := testNode
		node.Name = "Node" + strconv.Itoa(i)
		_, _, err := th.AdminClient.CreateNode(&node)
		require.NoError(t, err)
	}

	t.Run("can get first page of nodes", func(t *testing.T) {
		nodes, _, err := th.AdminClient.GetNodes(0, 10, "", "", "")
		require.NoError(t, err)
		require.Len(t, nodes, 10)
	})

	t.Run("can get last page of nodes", func(t *testing.T) {
		nodes, _, err := th.AdminClient.GetNodes(4, 10, "", "", "")
		require.NoError(t, err)
		require.Len(t, nodes, 10)
	})

	t.Run("can get middle page of nodes", func(t *testing.T) {
		nodes, _, err := th.AdminClient.GetNodes(2, 10, "", "", "")
		require.NoError(t, err)
		require.Len(t, nodes, 10)
	})
}

// will be implemented in the future. Needs status field in the NodeWithResources struct
//
//func TestUpdateNodeStatus(t *testing.T) {
//	th := functionaltesting.Setup(t)
//	defer th.TearDown()
//	node := testNode
//	node.Name = "Node1"
//	node.Description = "Description1"
//	createdNode, resp, err := th.AdminClient.CreateNode(&node)
//	require.NoError(t, err)
//	functionaltesting.CheckCreatedStatus(t, resp)
//	t.Run("can update node status", func(t *testing.T) {
//		status := model.NodeStatusForUser{
//			NodeID: createdNode.ID,
//			UserID: th.AdminUser.ID,
//			Status: "finished",
//		}
//		resp, err := th.AdminClient.UpdateNodeStatus(createdNode.ID, &status)
//		require.NoError(t, err)
//		functionaltesting.CheckOKStatus(t, resp)
//		nodeWithResources, resp2, err2 := th.AdminClient.GetNode(createdNode.ID)
//		require.NoError(t, err2)
//		functionaltesting.CheckOKStatus(t, resp2)
//		require.Truef(t, nodeWithResources, "nodes = %v", nodeWithResources)
//	})
//
//	t.Run("can't update node status with missing data", func(t *testing.T) {
//		status := model.NodeStatusForUser{
//			// fill in the status fields with missing or invalid data
//		}
//		resp, err := th.AdminClient.UpdateNodeStatus("validnodeid", &status)
//		require.Error(t, err)
//		functionaltesting.CheckBadRequestStatus(t, resp)
//	})
//}
