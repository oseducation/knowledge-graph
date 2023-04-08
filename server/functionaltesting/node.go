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
func (c *Client) GetNodes(page int, perPage int, etag string) ([]*model.Node, *Response, error) {
	query := fmt.Sprintf("?page=%v&per_page=%v", page, perPage)
	r, err := c.DoAPIGet(c.usersRoute()+query, etag)
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
