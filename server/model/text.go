package model

import (
	"encoding/json"
	"io"

	"github.com/pkg/errors"
)

// Text type defines texts of the node
type Text struct {
	ID             string `json:"id" db:"id"`
	CreatedAt      int64  `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt      int64  `json:"updated_at" db:"updated_at"`
	DeletedAt      int64  `json:"deleted_at" db:"deleted_at"`
	Name           string `json:"name" db:"name"`
	Text           string `json:"text" db:"text"`
	NodeID         string `json:"node_id" db:"node_id"`
	AuthorID       string `json:"author_id" db:"author_id"`
	AuthorUsername string `json:"author_username" db:"author_username"`
}

// IsValid validates the text and returns an error if it isn't configured correctly.
func (t *Text) IsValid() error {
	if !IsValidID(t.ID) {
		return invalidTextError("", "id", t.ID)
	}

	if !IsValidID(t.NodeID) {
		return invalidTextError(t.ID, "node_id", t.NodeID)
	}

	if !IsValidID(t.AuthorID) {
		return invalidTextError(t.ID, "author_id", t.AuthorID)
	}

	if t.CreatedAt == 0 {
		return invalidTextError(t.ID, "create_at", t.CreatedAt)
	}

	// TODO maybe check if text is a correct md?

	return nil
}

// BeforeSave should be called before storing the text
func (t *Text) BeforeSave() {
	t.ID = NewID()
	if t.CreatedAt == 0 {
		t.CreatedAt = GetMillis()
	}
	t.UpdatedAt = t.CreatedAt
}

// TextFromJSON will decode the input and return a Text
func TextFromJSON(data io.Reader) (*Text, error) {
	var text *Text
	if err := json.NewDecoder(data).Decode(&text); err != nil {
		return nil, errors.Wrap(err, "can't decode text")
	}
	return text, nil
}

func invalidTextError(textID, fieldName string, fieldValue any) error {
	return errors.Errorf("invalid text error. textID=%s %s=%v", textID, fieldName, fieldValue)
}

// TextGetOptions for getting and filtering texts
type TextGetOptions struct {
	// NodeID returns texts of specified node
	NodeID string
	// Page
	Page int
	// Page size
	PerPage int
	// with author username
	WithAuthorUsername bool
}

type TextGetOption func(*TextGetOptions)

func ComposeTextOptions(opts ...TextGetOption) TextGetOption {
	return func(options *TextGetOptions) {
		for _, f := range opts {
			f(options)
		}
	}
}

func TextNodeID(nodeID string) TextGetOption {
	return func(args *TextGetOptions) {
		args.NodeID = nodeID
	}
}

func TextPage(page int) TextGetOption {
	return func(args *TextGetOptions) {
		args.Page = page
	}
}

func TextPerPage(perPage int) TextGetOption {
	return func(args *TextGetOptions) {
		args.PerPage = perPage
	}
}

func TextWithAuthorUsername() TextGetOption {
	return func(args *TextGetOptions) {
		args.WithAuthorUsername = true
	}
}
