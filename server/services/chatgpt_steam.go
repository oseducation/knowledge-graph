package services

import (
	"bufio"
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"github.com/pkg/errors"
)

type ChatStream interface {
	Recv() (string, error)
	Close()
}

type streamReader struct {
	isFinished bool

	reader   *bufio.Reader
	response *http.Response
}

type ChatCompletionStreamChoiceDelta struct {
	Content string `json:"content,omitempty"`
	Role    string `json:"role,omitempty"`
}

type ChatCompletionStreamChoice struct {
	Index        int                             `json:"index"`
	Delta        ChatCompletionStreamChoiceDelta `json:"delta"`
	FinishReason string                          `json:"finish_reason"`
}

type ChatCompletionStreamResponse struct {
	ID      string                       `json:"id"`
	Object  string                       `json:"object"`
	Created int64                        `json:"created"`
	Model   string                       `json:"model"`
	Choices []ChatCompletionStreamChoice `json:"choices"`
}

func CreateChatGPTStream(response *http.Response) ChatStream {
	return &streamReader{
		reader:     bufio.NewReader(response.Body),
		response:   response,
		isFinished: false,
	}
}

func (stream *streamReader) Recv() (string, error) {
	if stream.isFinished {
		return "", io.EOF
	}

	for i := 0; i < 10; i++ {
		response, err := stream.processResponse()
		if err != nil {
			return "", err
		}

		if len(response.Choices) == 1 && response.Choices[0].Index == 0 && response.Choices[0].Delta.Content != "" {
			return response.Choices[0].Delta.Content, nil
		}

	}
	return "", errors.New("unexpected response")
}

var (
	headerData  = []byte("data: ")
	errorPrefix = []byte(`data: {"error":`)
)

func (stream *streamReader) processResponse() (*ChatCompletionStreamResponse, error) {
	for {
		rawLine, err := stream.reader.ReadBytes('\n')
		if err != nil {
			return nil, err
		}

		noSpaceLine := bytes.TrimSpace(rawLine)
		if bytes.HasPrefix(noSpaceLine, errorPrefix) {
			return nil, errors.New(string(noSpaceLine))
		}
		if len(noSpaceLine) == 0 {
			continue
		}

		if !bytes.HasPrefix(noSpaceLine, headerData) {
			return nil, errors.Errorf("unexpected header data - %s", string(noSpaceLine))
		}

		noPrefixLine := bytes.TrimPrefix(noSpaceLine, headerData)
		if string(noPrefixLine) == "[DONE]" {
			stream.isFinished = true
			return nil, io.EOF
		}

		var response *ChatCompletionStreamResponse
		err = json.Unmarshal(noPrefixLine, &response)
		if err != nil {
			return nil, err
		}

		return response, nil
	}
}

func (stream *streamReader) Close() {
	stream.response.Body.Close()
}
