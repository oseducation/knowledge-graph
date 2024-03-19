package services

import (
	"io"
)

type stringStreamReader struct {
	isFinished bool
	text       string
}

func CreateStringStream(text string) ChatStream {
	return &stringStreamReader{
		text:       text,
		isFinished: false,
	}
}

func (stream *stringStreamReader) Recv() (string, error) {
	if stream.isFinished {
		return "", io.EOF
	}

	stream.isFinished = true
	return stream.text, nil
}

func (stream *stringStreamReader) Close() {
}
