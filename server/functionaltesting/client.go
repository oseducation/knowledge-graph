package functionaltesting

import (
	"errors"
	"io"
	"net/http"
	"strings"
)

const (
	HeaderRequestID   = "X-Request-ID"
	HeaderVersionID   = "X-Version-ID"
	HeaderEtagServer  = "ETag"
	HeaderEtagClient  = "If-None-Match"
	HeaderAuth        = "Authorization"
	HeaderToken       = "Token"
	HeaderBearer      = "Bearer"
	HeaderContentType = "Content-Type"
	JSONContentType   = "application/json"

	APIURLSuffix = "/api/v1"
)

type Client struct {
	URL        string       // The location of the server, for example  "http://localhost:9081"
	APIURL     string       // The api location of the server, for example "http://localhost:9081/api/v1"
	HTTPClient *http.Client // The http client
	AuthToken  string
	AuthType   string
	HTTPHeader map[string]string // Headers to be copied over for each request
}

type Response struct {
	StatusCode    int
	RequestID     string
	Etag          string
	ServerVersion string
	Header        http.Header
}

func NewClient(url string) *Client {
	url = strings.TrimRight(url, "/")
	return &Client{url, url + APIURLSuffix, &http.Client{}, "", "", map[string]string{}}
}

func (c *Client) DoAPIGet(url string, etag string) (*http.Response, error) {
	return c.DoAPIRequest(http.MethodGet, c.APIURL+url, "", etag)
}

func (c *Client) DoAPIPost(url string, data string) (*http.Response, error) {
	return c.DoAPIRequest(http.MethodPost, c.APIURL+url, data, "")
}
func (c *Client) DoAPIPut(url string, data string) (*http.Response, error) {
	return c.DoAPIRequest(http.MethodPut, c.APIURL+url, data, "")
}

func (c *Client) DoAPIDelete(url string, data string) (*http.Response, error) {
	return c.DoAPIRequest(http.MethodDelete, c.APIURL+url, data, "")
}

func (c *Client) DoAPIRequest(method, url, data, etag string) (*http.Response, error) {
	return c.DoAPIRequestReader(method, url, strings.NewReader(data), map[string]string{HeaderEtagClient: etag, HeaderContentType: JSONContentType})
}

func (c *Client) DoAPIRequestReader(method, url string, data io.Reader, headers map[string]string) (*http.Response, error) {
	rq, err := http.NewRequest(method, url, data)
	if err != nil {
		return nil, err
	}

	for k, v := range headers {
		rq.Header.Set(k, v)
	}

	if c.AuthToken != "" {
		rq.Header.Set(HeaderAuth, c.AuthType+" "+c.AuthToken)
	}

	if c.HTTPHeader != nil && len(c.HTTPHeader) > 0 {
		for k, v := range c.HTTPHeader {
			rq.Header.Set(k, v)
		}
	}

	rp, err := c.HTTPClient.Do(rq)
	if err != nil {
		return rp, err
	}

	if rp.StatusCode == 304 {
		return rp, nil
	}

	if rp.StatusCode >= 300 {
		defer closeBody(rp)
		return rp, ErrorFromJSON(rp.Body)
	}

	return rp, nil
}

func BuildResponse(r *http.Response) *Response {
	if r == nil {
		return nil
	}

	return &Response{
		StatusCode:    r.StatusCode,
		RequestID:     r.Header.Get(HeaderRequestID),
		Etag:          r.Header.Get(HeaderEtagServer),
		ServerVersion: r.Header.Get(HeaderVersionID),
		Header:        r.Header,
	}
}

func closeBody(r *http.Response) {
	if r.Body != nil {
		_, _ = io.Copy(io.Discard, r.Body)
		_ = r.Body.Close()
	}
}

// ErrorFromJSON will decode the input and return an Error
func ErrorFromJSON(data io.Reader) error {
	str := ""
	bytes, rerr := io.ReadAll(data)
	if rerr != nil {
		str = rerr.Error()
	} else {
		str = string(bytes)
	}

	return errors.New(str)

}
