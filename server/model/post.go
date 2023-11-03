package model

import (
	"encoding/json"
	"io"
	"unicode/utf8"

	"github.com/pkg/errors"
)

const (
	PostTypeWithActions = "with_actions"
	PostTypeVideo       = "video"
	PostTypeText        = "text"
	PostTypeTest        = "test"
)

const PostMessageMaxRunes = 65536
const PropsMaxSize = 8096
const PostDirectMessageLocationExample = "ql3jdjjdtq116d1tqd766ltthl_ql3jdjjdtq116d1tqd766ltthl"

type PostActionType string

const (
	PostActionTypeLink      PostActionType = "link"
	PostActionTypeNextTopic PostActionType = "next_topic"
)

// Post type defines user post object
type Post struct {
	ID         string                 `json:"id" db:"id"`
	CreatedAt  int64                  `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt  int64                  `json:"updated_at,omitempty" db:"updated_at"`
	DeletedAt  int64                  `json:"deleted_at" db:"deleted_at"`
	LocationID string                 `json:"location_id" db:"location_id"`
	UserID     string                 `json:"user_id" db:"user_id"`
	Message    string                 `json:"message" db:"message"`
	PostType   string                 `json:"post_type" db:"post_type"`
	Props      map[string]interface{} `json:"props" db:"props"`
}

type PostWithUser struct {
	Post
	User *User `json:"user" db:"_"`
}

type Option struct {
	ID                string         `json:"id" db:"id"`
	TextOnButton      string         `json:"text_on_button" db:"text_on_button"`
	MessageAfterClick string         `json:"message_after_click" db:"message_after_click"`
	Action            PostActionType `json:"action" db:"action"`
	Link              string         `json:"link" db:"link"`
}

// IsValid validates the post and returns an error if it isn't configured correctly.
func (p *Post) IsValid() error {
	if !IsValidID(p.ID) {
		return invalidPostError("", "id", p.ID)
	}

	if p.CreatedAt == 0 {
		return invalidPostError(p.ID, "create_at", p.CreatedAt)
	}

	if p.UpdatedAt == 0 {
		return invalidPostError(p.ID, "updated_at", p.UpdatedAt)
	}

	if !IsValidID(p.LocationID) && len(p.LocationID) != len(PostDirectMessageLocationExample) {
		return invalidPostError(p.ID, "location_id", p.LocationID)
	}

	if !IsValidID(p.UserID) {
		return invalidPostError(p.ID, "user_id", p.UserID)
	}

	if utf8.RuneCountInString(p.Message) > PostMessageMaxRunes {
		return invalidPostError(p.ID, "message length", len(p.Message))
	}

	if p.PostType != "" &&
		p.PostType != PostTypeWithActions &&
		p.PostType != PostTypeVideo &&
		p.PostType != PostTypeText &&
		p.PostType != PostTypeTest {
		return invalidPostError(p.ID, "type", p.PostType)
	}

	propsJSON, err := json.Marshal(p.Props)
	if err != nil {
		return errors.Wrapf(err, "failed to marshal props json: '%v'", p.Props)
	}
	if len(propsJSON) > PropsMaxSize {
		return invalidPostError(p.ID, "props size", len(propsJSON))
	}
	return nil
}

// BeforeSave should be called before storing the post
func (p *Post) BeforeSave() {
	p.ID = NewID()
	if p.CreatedAt == 0 {
		p.CreatedAt = GetMillis()
	}
	p.UpdatedAt = p.CreatedAt

	p.Message = SanitizeUnicode(p.Message)
}

// BeforeUpdate should be run before updating the post in the db.
func (p *Post) BeforeUpdate() {
	p.Message = SanitizeUnicode(p.Message)
	p.UpdatedAt = GetMillis()
}

// Clone returns copy of an object.
func (p *Post) Clone() *Post {
	var newPost Post
	newPost.ID = p.ID
	newPost.CreatedAt = p.CreatedAt
	newPost.UpdatedAt = p.UpdatedAt
	newPost.DeletedAt = p.DeletedAt
	newPost.Message = p.Message
	newPost.UserID = p.UserID
	newPost.LocationID = p.LocationID
	return &newPost
}

// PostFromJSON will decode the input and return a Post
func PostFromJSON(data io.Reader) (*Post, error) {
	var post *Post
	if err := json.NewDecoder(data).Decode(&post); err != nil {
		return nil, errors.Wrap(err, "can't decode post")
	}
	return post, nil
}

func invalidPostError(postID, fieldName string, fieldValue any) error {
	return errors.Errorf("invalid post error. postID=%s %s=%v", postID, fieldName, fieldValue)
}

// PostGetOptions for getting and filtering posts
type PostGetOptions struct {
	TermInMessage  string
	UserID         string
	LocationID     string
	Page           int
	PerPage        int
	IncludeDeleted bool
}

type PostGetOption func(*PostGetOptions)

func ComposePostOptions(opts ...PostGetOption) PostGetOption {
	return func(options *PostGetOptions) {
		for _, f := range opts {
			f(options)
		}
	}
}

func TermInMessage(term string) PostGetOption {
	return func(args *PostGetOptions) {
		args.TermInMessage = term
	}
}

func PostUserID(userID string) PostGetOption {
	return func(args *PostGetOptions) {
		args.UserID = userID
	}
}

func PostLocationID(locationID string) PostGetOption {
	return func(args *PostGetOptions) {
		args.LocationID = locationID
	}
}

func PostPage(page int) PostGetOption {
	return func(args *PostGetOptions) {
		args.Page = page
	}
}

func PostPerPage(perPage int) PostGetOption {
	return func(args *PostGetOptions) {
		args.PerPage = perPage
	}
}

func PostDeleted(deleted bool) PostGetOption {
	return func(args *PostGetOptions) {
		args.IncludeDeleted = deleted
	}
}
