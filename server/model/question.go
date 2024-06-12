package model

import (
	"encoding/json"
	"io"

	"github.com/pkg/errors"
)

// Question type defines question/test on a specific node
type Question struct {
	ID           string           `json:"id" db:"id"`
	CreatedAt    int64            `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt    int64            `json:"updated_at,omitempty" db:"updated_at"`
	DeletedAt    int64            `json:"deleted_at" db:"deleted_at"`
	Name         string           `json:"name" db:"name"`
	Question     string           `json:"question" db:"question"`
	QuestionType string           `json:"question_type" db:"question_type"`
	NodeID       string           `json:"node_id" db:"node_id"`
	Explanation  string           `json:"explanation" db:"explanation"`
	Choices      []QuestionChoice `json:"choices" db:"_"`
}

type QuestionChoice struct {
	ID            string `json:"id" db:"id"`
	Choice        string `json:"choice" db:"choice"`
	IsRightChoice bool   `json:"is_right_choice" db:"is_right_choice"`
}

// IsValid validates the question and returns an error if it isn't configured correctly.
func (q *Question) IsValid() error {
	if !IsValidID(q.ID) {
		return invalidQuestionError("", "id", q.ID)
	}

	if !IsValidID(q.NodeID) || q.NodeID != "" {
		return invalidTextError(q.ID, "node_id", q.NodeID)
	}

	if q.CreatedAt == 0 {
		return invalidTextError(q.ID, "create_at", q.CreatedAt)
	}

	// TODO maybe check if question field is a correct md?

	return nil
}

// BeforeSave should be called before storing the question
func (q *Question) BeforeSave() {
	q.ID = NewID()
	if q.CreatedAt == 0 {
		q.CreatedAt = GetMillis()
	}
	q.UpdatedAt = q.CreatedAt
}

// BeforeSave should be called before storing the question choice
func (qc *QuestionChoice) BeforeSave() {
	qc.ID = NewID()
}

// QuestionFromJSON will decode the input and return a Question
func QuestionFromJSON(data io.Reader) (*Question, error) {
	var question *Question
	if err := json.NewDecoder(data).Decode(&question); err != nil {
		return nil, errors.Wrap(err, "can't decode text")
	}
	return question, nil
}

// QuestionsFromJSON will decode the input and return a Question
func QuestionsFromJSON(data io.Reader) ([]Question, error) {
	var questions []Question
	if err := json.NewDecoder(data).Decode(&questions); err != nil {
		return nil, errors.Wrap(err, "can't decode text")
	}
	return questions, nil
}

func invalidQuestionError(questionID, fieldName string, fieldValue any) error {
	return errors.Errorf("invalid question error. questionID=%s %s=%v", questionID, fieldName, fieldValue)
}

// QuestionGetOptions for getting and filtering questions
type QuestionGetOptions struct {
	// NodeID returns texts of specified node
	NodeID string
	// Page
	Page int
	// Page size
	PerPage int
	// if true returns questions with answers populated
	WithAnswers bool
}

type QuestionGetOption func(*QuestionGetOptions)

func ComposeQuestionOptions(opts ...QuestionGetOption) QuestionGetOption {
	return func(options *QuestionGetOptions) {
		for _, f := range opts {
			f(options)
		}
	}
}

func QuestionNodeID(nodeID string) QuestionGetOption {
	return func(args *QuestionGetOptions) {
		args.NodeID = nodeID
	}
}

func QuestionPage(page int) QuestionGetOption {
	return func(args *QuestionGetOptions) {
		args.Page = page
	}
}

func QuestionPerPage(perPage int) QuestionGetOption {
	return func(args *QuestionGetOptions) {
		args.PerPage = perPage
	}
}

func QuestionWithAnswers() QuestionGetOption {
	return func(args *QuestionGetOptions) {
		args.WithAnswers = true
	}
}
