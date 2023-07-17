package functionaltesting

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

func (c *Client) nodesRoute() string {
	return "/nodes"
}

// CreateNode creates a node in the system based on the provided node struct.
func (c *Client) CreateNode(node *model.Node) (*model.Node, *Response, error) {
	nodeJSON, err := json.Marshal(node)
	if err != nil {
		return nil, nil, errors.Wrap(err, "can't marshal node")
	}

	r, err := c.DoAPIPost(c.nodesRoute(), string(nodeJSON))
	if err != nil {
		return nil, BuildResponse(r), err
	}
	defer closeBody(r)
	var n model.Node
	if err := json.NewDecoder(r.Body).Decode(&n); err != nil {
		return nil, nil, errors.Wrap(err, "can't decode node")
	}
	return &n, BuildResponse(r), nil
}

// GetNodes returns a page of nodes on the system. Page counting starts at 0.
func (c *Client) GetNodes(page int, perPage int, name string, description string, etag string) ([]*model.Node, *Response, error) {
	query := fmt.Sprintf(
		"?page=%v&per_page=%v&term_in_name=%v&term_in_description=%v",
		page,
		perPage,
		name,
		description,
	)

	r, err := c.DoAPIGet(c.nodesRoute()+query, etag)
	if err != nil {
		return nil, BuildResponse(r), err
	}
	defer closeBody(r)
	var list []*model.Node
	if r.StatusCode == http.StatusNotModified {
		return list, BuildResponse(r), nil
	}
	if err := json.NewDecoder(r.Body).Decode(&list); err != nil {
		return nil, nil, errors.Wrap(err, "can't decode nodes")
	}
	return list, BuildResponse(r), nil
}

// UpdateNode updates a node in the system based on the provided node struct.
func (c *Client) UpdateNode(node *model.Node) (*Response, error) {
	nodeJSON, err := json.Marshal(node)
	if err != nil {
		return nil, errors.Wrap(err, "can't marshal node")
	}

	r, err := c.DoAPIPut(c.nodesRoute(), string(nodeJSON))
	if err != nil {
		return BuildResponse(r), err
	}
	defer closeBody(r)
	return BuildResponse(r), nil
}

// DeleteNode deletes a node in the system based on the provided node struct.
func (c *Client) DeleteNode(nodeId string) (*Response, error) {

	r, err := c.DoAPIDelete(c.nodesRoute()+"/"+nodeId, "")
	if err != nil {
		return BuildResponse(r), err
	}
	defer closeBody(r)
	return BuildResponse(r), nil
}

// GetNode returns a node on the system based on the provided nodeID.
func (c *Client) GetNode(nodeID string) (*model.NodeWithResources, *Response, error) {
	r, err := c.DoAPIGet(c.nodesRoute()+"/"+nodeID, "")
	if err != nil {
		return nil, BuildResponse(r), err
	}
	defer closeBody(r)
	var n model.NodeWithResources
	if r.StatusCode == http.StatusNotModified {
		return &n, BuildResponse(r), nil
	}
	if err := json.NewDecoder(r.Body).Decode(&n); err != nil {
		return nil, nil, errors.Wrap(err, "can't decode node")
	}
	return &n, BuildResponse(r), nil
}

// AddVideoToNode adds a video to a node in the system based on the provided nodeID and videoID.
func (c *Client) AddVideoToNode(nodeID string, videoID string) (*Response, error) {
	r, err := c.DoAPIPost(c.nodesRoute()+"/"+nodeID+"/videos/"+videoID, "")
	if err != nil {
		return BuildResponse(r), err
	}
	defer closeBody(r)
	return BuildResponse(r), nil
}

// UpdateNodeStatus updates a node status in the system based on the provided nodeID and status.
func (c *Client) UpdateNodeStatus(nodeID string, status *model.NodeStatusForUser) (*Response, error) {
	statusJSON, err := json.Marshal(status)
	if err != nil {
		return nil, errors.Wrap(err, "can't marshal status")
	}

	r, err := c.DoAPIPut(c.nodesRoute()+"/"+nodeID+"/status", string(statusJSON))
	if err != nil {
		return BuildResponse(r), err
	}
	defer closeBody(r)
	return BuildResponse(r), nil

}
