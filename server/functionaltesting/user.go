package functionaltesting

import (
	"encoding/json"
	"fmt"
	"io"

	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

func (c *Client) usersRoute() string {
	return "/users"
}

func (c *Client) RegisterUser(user *model.User) (*model.User, *Response, error) {
	userJSON, err := json.Marshal(user)
	if err != nil {
		return nil, nil, errors.Wrap(err, "can't marshal user")
	}

	r, err := c.DoAPIPost(c.usersRoute()+"/register", string(userJSON))
	if err != nil {
		return nil, BuildResponse(r), err
	}

	u, err := decodeUser(r.Body)
	if err != nil {
		return nil, BuildResponse(r), err
	}
	return u, BuildResponse(r), nil
}

// CreateUser creates a user in the system based on the provided user struct.
func (c *Client) CreateUser(user *model.User) (*model.User, *Response, error) {
	userJSON, err := json.Marshal(user)
	if err != nil {
		return nil, nil, errors.Wrap(err, "can't marshal user")
	}

	r, err := c.DoAPIPost(c.usersRoute(), string(userJSON))
	if err != nil {
		return nil, BuildResponse(r), err
	}
	defer closeBody(r)
	u, err := decodeUser(r.Body)
	if err != nil {
		return nil, BuildResponse(r), err
	}
	return u, BuildResponse(r), nil
}

// UpdateUser updates a user in the system based on the provided user struct.
func (c *Client) UpdateUser(user *model.User) (*Response, error) {
	userJSON, err := json.Marshal(user)
	if err != nil {
		return nil, errors.Wrap(err, "can't marshal user")
	}

	r, err := c.DoAPIPut(c.usersRoute(), string(userJSON))
	if err != nil {
		return BuildResponse(r), err
	}
	defer closeBody(r)
	if err != nil {
		return BuildResponse(r), err
	}
	return BuildResponse(r), nil
}

// GetUsers gets users.
func (c *Client) GetUsers() (*[]model.User, *Response, error) {

	r, err := c.DoAPIGet(c.usersRoute(), "")
	if err != nil {
		return nil, BuildResponse(r), err
	}
	defer closeBody(r)
	u, err := decodeUsers(r.Body)
	if err != nil {
		return nil, BuildResponse(r), err
	}
	return u, BuildResponse(r), nil
}

// DeleteUser deletes given user.
func (c *Client) DeleteUser(userId string) (*Response, error) {
	query := fmt.Sprintf("?user_id=%v&userId", userId)
	r, err := c.DoAPiDelete(c.usersRoute()+query, "")
	if err != nil {
		return BuildResponse(r), err
	}
	defer closeBody(r)
	return BuildResponse(r), nil
}

// LoginByEmail authenticates a user by user email and password.
func (c *Client) LoginByEmail(email string, password string) (*model.User, *Response, error) {
	m := make(map[string]string)
	m["email"] = email
	m["password"] = password
	return c.login(m)
}

// Logout logs out a user.
func (c *Client) Logout() (*Response, error) {
	r, err := c.DoAPIPost(c.usersRoute()+"/logout", "")
	if err != nil {
		return BuildResponse(r), err
	}
	defer closeBody(r)
	c.AuthToken = r.Header.Get(HeaderToken)
	c.AuthType = HeaderBearer

	return BuildResponse(r), nil
}

func (c *Client) login(m map[string]string) (*model.User, *Response, error) {
	b, err := json.Marshal(m)
	if err != nil {
		return nil, nil, errors.Wrap(err, "can't marshal map")
	}

	r, err := c.DoAPIPost(c.usersRoute()+"/login", string(b))
	if err != nil {
		return nil, BuildResponse(r), err
	}
	defer closeBody(r)
	c.AuthToken = r.Header.Get(HeaderToken)
	c.AuthType = HeaderBearer

	u, err := decodeUser(r.Body)
	if err != nil {
		return nil, BuildResponse(r), err
	}
	return u, BuildResponse(r), nil
}

func (c *Client) VerifyUserEmail(token string) (*Response, error) {
	m := make(map[string]string)
	m["token"] = token
	b, err := json.Marshal(m)
	if err != nil {
		return nil, errors.Wrap(err, "can't marshal map")
	}

	r, err := c.DoAPIPost(c.usersRoute()+"/email/verify", string(b))
	if err != nil {
		return BuildResponse(r), err
	}
	defer closeBody(r)
	c.AuthToken = r.Header.Get(HeaderToken)
	c.AuthType = HeaderBearer
	return BuildResponse(r), nil
}

func (c *Client) SendVerificationEmail() (*Response, error) {
	r, err := c.DoAPIPost(c.usersRoute()+"/email/verify/send", "")
	if err != nil {
		return BuildResponse(r), err
	}
	defer closeBody(r)
	c.AuthToken = r.Header.Get(HeaderToken)
	c.AuthType = HeaderBearer
	return BuildResponse(r), nil
}

func decodeUser(reader io.ReadCloser) (*model.User, error) {
	var user model.User
	if err := json.NewDecoder(reader).Decode(&user); err != nil {
		return nil, errors.Wrap(err, "can't decode user")
	}
	return &user, nil
}

func decodeUsers(reader io.ReadCloser) (*[]model.User, error) {
	var users []model.User
	if err := json.NewDecoder(reader).Decode(&users); err != nil {
		return nil, errors.Wrap(err, "can't decode user")
	}
	return &users, nil
}
