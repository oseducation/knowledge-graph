package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/pkg/errors"
)

const chatGPTAPIKey = "CHAT_GPT_API_KEY"
const chatGPTOrganizationID = "CHAT_GPT_ORGANIZATION_ID"

type ChatGPTModel string

const (
	GPT35Turbo    ChatGPTModel = "gpt-3.5-turbo"
	GPT35Turbo16k ChatGPTModel = "gpt-3.5-turbo-16k"

	GPT4             ChatGPTModel = "gpt-4"
	GPT4_32k         ChatGPTModel = "gpt-4-32k"
	GPT4_1106Preview ChatGPTModel = "gpt-4-1106-preview"
)

type ChatGPTModelRole string

const (
	ChatGPTModelRoleUser      ChatGPTModelRole = "user"
	ChatGPTModelRoleSystem    ChatGPTModelRole = "system"
	ChatGPTModelRoleAssistant ChatGPTModelRole = "assistant"
)

type ChatCompletionRequest struct {
	// Required
	// A list of messages comprising the conversation so far
	Messages []ChatMessage `json:"messages"`

	// (Required)
	// ID of the model to use.
	Model ChatGPTModel `json:"model"`

	// (Optional - default: 0)
	// Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far,
	// decreasing the model's likelihood to repeat the same line verbatim.
	FrequencyPenalty float64 `json:"frequency_penalty,omitempty"`

	// (Optional - default: infinite)
	// The maximum number of tokens allowed for the generated answer. By default,
	// the number of tokens the model can return will be (4096 - prompt tokens).
	MaxTokens int `json:"max_tokens,omitempty"`

	// (Optional - default: 1)
	// How many chat completion choices to generate for each input message.
	N int `json:"n,omitempty"`

	// (Optional - default: 0)
	// Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far,
	// increasing the model's likelihood to talk about new topics.
	PresencePenalty float64 `json:"presence_penalty,omitempty"`

	// (Optional - default: text)
	// An object specifying the format that the model must output.
	// Setting to { "type": "json_object" } enables JSON mode, which guarantees the message the model generates is valid JSON.
	ResponseFormat string `json:"response_format,omitempty"`

	// (Optional)
	// This feature is in Beta. If specified, our system will make a best effort to sample deterministically
	Seed int `json:"seed,omitempty"`

	// (Optional - default: null)
	// Up to 4 sequences where the API will stop generating further tokens.
	Stop []string `json:"stop,omitempty"`

	// (Optional - default: fasle)
	// If set, partial message deltas will be sent, like in ChatGPT.
	Stream bool `json:"stream,omitempty"`

	// (Optional - default: 1)
	// What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
	// We generally recommend altering this or top_p but not both.
	Temperature float64 `json:"temperature,omitempty"`

	// (Optional - default: 1)
	// An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.
	// We generally recommend altering this or temperature but not both.
	TopP float64 `json:"top_p,omitempty"`

	// (Optional)
	// A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse
	User string `json:"user,omitempty"`
}

type ChatMessage struct {
	Role    ChatGPTModelRole `json:"role"`
	Content string           `json:"content"`
}

type ChatResponse struct {
	ID        string               `json:"id"`
	Object    string               `json:"object"`
	CreatedAt int64                `json:"created_at"`
	Choices   []ChatResponseChoice `json:"choices"`
	Usage     ChatResponseUsage    `json:"usage"`
}

type ChatResponseChoice struct {
	Index        int         `json:"index"`
	Message      ChatMessage `json:"message"`
	FinishReason string      `json:"finish_reason"`
}

type ChatResponseUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

var (
	// ErrAPIKeyRequired is returned when the API Key is not provided
	ErrAPIKeyRequired = errors.New("ChatGPT API Key is required")

	// ErrInvalidModel is returned when the model is invalid
	ErrInvalidModel = errors.New("invalid model")

	// ErrNoMessages is returned when no messages are provided
	ErrNoMessages = errors.New("no messages provided")

	// ErrInvalidRole is returned when the role is invalid
	ErrInvalidRole = errors.New("invalid role. Only `user`, `system` and `assistant` are supported")

	// ErrInvalidTemperature is returned when the temperature is invalid
	ErrInvalidTemperature = errors.New("invalid temperature. 0<= temp <= 2")

	// ErrInvalidPresencePenalty
	ErrInvalidPresencePenalty = errors.New("invalid presence penalty. -2<= presence penalty <= 2")

	// ErrInvalidFrequencyPenalty
	ErrInvalidFrequencyPenalty = errors.New("invalid frequency penalty. -2<= frequency penalty <= 2")
)

const (
	apiURL = "https://api.openai.com/v1"
)

type ChatGPTServiceInterface interface {
	Send(userID, systemMessage string, messages []string) (string, error)
	SendStream(userID, systemMessage string, messages []string) (ChatStream, error)
}

type ChatGPTService struct {
	// HTTP client used to communicate with the API.
	client *http.Client

	// Config
	config *Config
}

type ChatGPTServiceDummy struct {
}

type Config struct {
	// Base URL for API requests.
	BaseURL string

	// API Key (Required)
	APIKey string

	// Organization ID (Optional)
	OrganizationID string
}

func NewCHhatGPTService() (ChatGPTServiceInterface, error) {
	apiKey, ok := os.LookupEnv(chatGPTAPIKey)
	if !ok || apiKey == "" || apiKey == "test" {
		return &ChatGPTServiceDummy{}, nil
	}
	orgID, ok := os.LookupEnv(chatGPTOrganizationID)
	if !ok {
		orgID = ""
	}

	return &ChatGPTService{
		client: &http.Client{},
		config: &Config{
			BaseURL:        apiURL,
			APIKey:         apiKey,
			OrganizationID: orgID,
		},
	}, nil
}

func (c *ChatGPTService) SendStream(userID, systemMessage string, messages []string) (ChatStream, error) {
	chatMessages := getChatMessages(systemMessage, messages)

	req := &ChatCompletionRequest{
		Model:    GPT35Turbo,
		Messages: chatMessages,
		User:     userID,
		Stream:   true,
	}

	resp, err := c.sendStream(context.Background(), req)
	if err != nil {
		return nil, err
	}

	return CreateChatGPTStream(resp), nil
}

func getChatMessages(systemMessage string, messages []string) []ChatMessage {
	chatMessages := make([]ChatMessage, len(messages)+1)
	chatMessages[0] = ChatMessage{
		Role:    ChatGPTModelRoleSystem,
		Content: systemMessage,
	}
	for i, message := range messages {
		if i%2 == 0 {
			chatMessages[i+1] = ChatMessage{
				Role:    ChatGPTModelRoleUser,
				Content: message,
			}
		} else {
			chatMessages[i+1] = ChatMessage{
				Role:    ChatGPTModelRoleAssistant,
				Content: message,
			}
		}
	}
	return chatMessages
}

func (c *ChatGPTService) Send(userID, systemMessage string, messages []string) (string, error) {
	chatMessages := getChatMessages(systemMessage, messages)

	req := &ChatCompletionRequest{
		Model:    GPT35Turbo,
		Messages: chatMessages,
		User:     userID,
	}

	resp, err := c.send(context.Background(), req)
	if err != nil {
		return "", err
	}
	if len(resp.Choices) == 1 && resp.Choices[0].FinishReason == "stop" {
		return resp.Choices[0].Message.Content, nil
	}
	return "", errors.New("no response")
}

func (c *ChatGPTService) sendStream(ctx context.Context, req *ChatCompletionRequest) (*http.Response, error) {
	if err := validate(req); err != nil {
		return nil, err
	}
	if !req.Stream {
		return nil, errors.New("stream must be true")
	}

	reqBytes, _ := json.Marshal(req)

	endpoint := "/chat/completions"
	httpReq, err := http.NewRequest("POST", c.config.BaseURL+endpoint, bytes.NewBuffer(reqBytes))
	if err != nil {
		return nil, err
	}
	httpReq = httpReq.WithContext(ctx)

	res, err := c.sendRequestStream(httpReq)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c *ChatGPTService) sendRequestStream(req *http.Request) (*http.Response, error) {
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.config.APIKey))
	if c.config.OrganizationID != "" {
		req.Header.Set("OpenAI-Organization", c.config.OrganizationID)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "text/event-stream")

	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Connection", "keep-alive")
	res, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (c *ChatGPTService) send(ctx context.Context, req *ChatCompletionRequest) (*ChatResponse, error) {
	if err := validate(req); err != nil {
		return nil, err
	}

	reqBytes, _ := json.Marshal(req)

	endpoint := "/chat/completions"
	httpReq, err := http.NewRequest("POST", c.config.BaseURL+endpoint, bytes.NewBuffer(reqBytes))
	if err != nil {
		return nil, err
	}
	httpReq = httpReq.WithContext(ctx)

	res, err := c.sendRequest(httpReq)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var chatResponse ChatResponse
	if err := json.NewDecoder(res.Body).Decode(&chatResponse); err != nil {
		return nil, err
	}

	return &chatResponse, nil
}

func validate(req *ChatCompletionRequest) error {
	if len(req.Messages) == 0 {
		return ErrNoMessages
	}

	isAllowed := false

	allowedModels := []ChatGPTModel{
		GPT35Turbo, GPT35Turbo16k, GPT4, GPT4_32k,
	}

	for _, model := range allowedModels {
		if req.Model == model {
			isAllowed = true
		}
	}

	if !isAllowed {
		return ErrInvalidModel
	}

	for _, message := range req.Messages {
		if message.Role != ChatGPTModelRoleUser && message.Role != ChatGPTModelRoleSystem && message.Role != ChatGPTModelRoleAssistant {
			return ErrInvalidRole
		}
	}

	if req.Temperature < 0 || req.Temperature > 2 {
		return ErrInvalidTemperature
	}

	if req.PresencePenalty < -2 || req.PresencePenalty > 2 {
		return ErrInvalidPresencePenalty
	}

	if req.FrequencyPenalty < -2 || req.FrequencyPenalty > 2 {
		return ErrInvalidFrequencyPenalty
	}

	return nil
}

func (c *ChatGPTService) sendRequest(req *http.Request) (*http.Response, error) {
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.config.APIKey))
	if c.config.OrganizationID != "" {
		req.Header.Set("OpenAI-Organization", c.config.OrganizationID)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	res, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	if res.StatusCode != http.StatusOK {
		// Parse body
		var errMessage interface{}
		if err := json.NewDecoder(res.Body).Decode(&errMessage); err != nil {
			return nil, err
		}

		return nil, errors.Errorf("api request failed: status Code: %d %s %s Message: %+v", res.StatusCode, res.Status, res.Request.URL, errMessage)
	}

	return res, nil
}

func (c *ChatGPTServiceDummy) Send(userID, systemMessage string, messages []string) (string, error) {
	return fmt.Sprintf("Dummy answer for user `%s`'s message number %d, systemMessage: \n\n %s\n", userID, len(messages), systemMessage), nil
}

func (c *ChatGPTServiceDummy) SendStream(_, _ string, _ []string) (ChatStream, error) {
	return nil, nil
}
