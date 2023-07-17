package model

import (
	"encoding/json"
	"io"
	"unicode/utf8"

	"github.com/pkg/errors"
)

const (
	NodeNameMaxRunes        = 128
	NodeNameMinRunes        = 3
	NodeDescriptionMaxRunes = 2048

	NodeTypeLecture = "lecture"
	NodeTypeExample = "example"

	NodeStatusStarted  = "started"
	NodeStatusWatched  = "watched"
	NodeStatusFinished = "finished"
	NodeStatusUnseen   = "unseen"
)

// Node type defines Knowledge Graph node
type Node struct {
	ID          string `json:"id" db:"id"`
	CreatedAt   int64  `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt   int64  `json:"updated_at,omitempty" db:"updated_at"`
	DeletedAt   int64  `json:"deleted_at" db:"deleted_at"`
	Name        string `json:"name" db:"name"`
	Description string `json:"description,omitempty" db:"description"`
	NodeType    string `json:"node_type" db:"node_type"`
}

type NodeWithResources struct {
	Node
	Status      string   `json:"status" db:"_"`
	Videos      []*Video `json:"videos" db:"_"`
	ActiveUsers []*User  `json:"active_users" db:"_"`
}

type NodeStatusForUser struct {
	NodeID string `json:"node_id" db:"node_id"`
	Status string `json:"status" db:"status"`
	UserID string `json:"user_id" db:"user_id"`
}

// IsValid validates the node and returns an error if it isn't configured correctly.
func (n *Node) IsValid() error {
	if !IsValidID(n.ID) {
		return invalidNodeError("", "id", n.ID)
	}

	if n.CreatedAt == 0 {
		return invalidNodeError(n.ID, "create_at", n.CreatedAt)
	}

	if n.UpdatedAt == 0 {
		return invalidNodeError(n.ID, "updated_at", n.UpdatedAt)
	}

	if utf8.RuneCountInString(n.Name) > NodeNameMaxRunes || utf8.RuneCountInString(n.Name) < NodeNameMinRunes {
		return invalidNodeError(n.ID, "name", n.Name)
	}

	if utf8.RuneCountInString(n.Description) > NodeDescriptionMaxRunes {
		return invalidNodeError(n.ID, "description", n.Description)
	}

	if n.NodeType != NodeTypeExample && n.NodeType != NodeTypeLecture {
		return invalidNodeError(n.ID, "node_type", n.NodeType)
	}

	return nil
}

// BeforeSave should be called before storing the node
func (n *Node) BeforeSave() {
	n.ID = NewID()
	if n.CreatedAt == 0 {
		n.CreatedAt = GetMillis()
	}
	n.UpdatedAt = n.CreatedAt

	n.Name = SanitizeUnicode(n.Name)
	n.Description = SanitizeUnicode(n.Description)
}

// BeforeUpdate should be run before updating the node in the db.
func (n *Node) BeforeUpdate() {
	n.Name = SanitizeUnicode(n.Name)
	n.Description = SanitizeUnicode(n.Description)

	n.UpdatedAt = GetMillis()
}

// Clone returns copy of an object.
func (n *Node) Clone() *Node {
	var newNode Node
	newNode.ID = n.ID
	newNode.Name = n.Name
	newNode.NodeType = n.NodeType
	newNode.CreatedAt = n.CreatedAt
	newNode.UpdatedAt = n.UpdatedAt
	newNode.DeletedAt = n.DeletedAt
	newNode.Description = n.Description
	return &newNode
}

func (n *NodeStatusForUser) IsValid() error {
	if !IsValidID(n.NodeID) {
		return invalidNodeError("", "id", n.NodeID)
	}
	if !IsValidID(n.UserID) {
		return invalidNodeError(n.NodeID, "user_id", n.UserID)
	}
	if n.Status != NodeStatusStarted && n.Status != NodeStatusWatched &&
		n.Status != NodeStatusFinished && n.Status != NodeStatusUnseen {
		return invalidNodeError(n.NodeID, "status", n.Status)
	}
	return nil
}

// NodeFromJSON will decode the input and return a Node
func NodeFromJSON(data io.Reader) (*Node, error) {
	var node *Node
	if err := json.NewDecoder(data).Decode(&node); err != nil {
		return nil, errors.Wrap(err, "can't decode node")
	}
	return node, nil
}

func NodeStatusForUserFromJSON(data io.Reader) (*NodeStatusForUser, error) {
	var status *NodeStatusForUser
	if err := json.NewDecoder(data).Decode(&status); err != nil {
		return nil, errors.Wrap(err, "can't decode NodeStatusForUser")
	}
	return status, nil
}

func invalidNodeError(nodeID, fieldName string, fieldValue any) error {
	return errors.Errorf("invalid node error. nodeID=%s %s=%v", nodeID, fieldName, fieldValue)
}
