package store

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

type QuestionStore interface {
	Save(question *model.Question) (*model.Question, error)
	Get(id string) (*model.Question, error)
	GetQuestions(options *model.QuestionGetOptions) ([]*model.Question, error)
	Delete(question *model.Question) error
}

// SQLQuestionStore is a struct to store Questions
type SQLQuestionStore struct {
	sqlStore       *SQLStore
	questionSelect sq.SelectBuilder
}

// NewQuestionStore creates a new store for Questions.
func NewQuestionStore(db *SQLStore) QuestionStore {
	questionSelect := db.builder.
		Select(
			"q.id",
			"q.question",
			"q.question_type",
			"q.node_id",
		).
		From("questions q")

	return &SQLQuestionStore{
		sqlStore:       db,
		questionSelect: questionSelect,
	}
}

// Save saves question in the DB
func (qs *SQLQuestionStore) Save(question *model.Question) (*model.Question, error) {
	if question.ID != "" {
		return nil, errors.New("invalid input")
	}
	question.BeforeSave()
	if err := question.IsValid(); err != nil {
		return nil, err
	}

	_, err := qs.sqlStore.execBuilder(qs.sqlStore.db, qs.sqlStore.builder.
		Insert("questions").
		SetMap(map[string]interface{}{
			"id":            question.ID,
			"question":      question.Question,
			"question_type": question.QuestionType,
			"node_id":       question.NodeID,
		}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't save question with text: %s", question.Question)
	}

	for _, choice := range question.Choices {
		if err := qs.saveChoice(choice, question.ID); err != nil {
			return nil, errors.Wrapf(err, "can't save question(%s) choice: %s", question.ID, choice.Choice)
		}
	}
	return question, nil
}

func (qs *SQLQuestionStore) saveChoice(choice model.QuestionChoice, questionID string) error {
	choice.BeforeSave()
	_, err := qs.sqlStore.execBuilder(qs.sqlStore.db, qs.sqlStore.builder.
		Insert("question_choices").
		SetMap(map[string]interface{}{
			"id":              choice.ID,
			"question_id":     questionID,
			"choice":          choice.Choice,
			"is_right_choice": choice.IsRightChoice,
		}))
	if err != nil {
		return errors.Wrap(err, "can't save question choice")
	}

	return nil
}

// Get gets question by id
func (qs *SQLQuestionStore) Get(id string) (*model.Question, error) {
	var question model.Question
	if err := qs.sqlStore.getBuilder(qs.sqlStore.db, &question, qs.questionSelect.Where(sq.Eq{"q.id": id})); err != nil {
		return nil, errors.Wrapf(err, "can't get question by id: %s", id)
	}

	query := qs.sqlStore.builder.Select(
		"qc.id",
		"qc.choice",
		"qc.is_right_choice",
	).From("question_choices qc").Where(sq.Eq{"qc.question_id": id})

	var questionChoices []model.QuestionChoice
	if err := qs.sqlStore.selectBuilder(qs.sqlStore.db, &questionChoices, query); err != nil {
		return nil, errors.Wrapf(err, "can't get question choices for question %s", id)
	}

	question.Choices = questionChoices
	return &question, nil
}

// GetQuestions gets questions with options
func (qs *SQLQuestionStore) GetQuestions(options *model.QuestionGetOptions) ([]*model.Question, error) {
	var questions []*model.Question
	query := qs.questionSelect

	if options.NodeID != "" {
		query = query.Where(sq.Eq{"q.node_id": options.NodeID})
	}
	if options.PerPage > 0 {
		query = query.Limit(uint64(options.PerPage))
	}
	if options.Page >= 0 {
		query = query.Offset(uint64(options.Page * options.PerPage))
	}

	if err := qs.sqlStore.selectBuilder(qs.sqlStore.db, &questions, query); err != nil {
		return nil, errors.Wrapf(err, "can't get question with options %v", options)
	}

	if !options.WithAnswers {
		return questions, nil
	}

	questionIDs := make([]string, 0, len(questions))
	for _, question := range questions {
		questionIDs = append(questionIDs, question.ID)
	}

	query = qs.sqlStore.builder.Select(
		"qc.id",
		"qc.question_id",
		"qc.choice",
		"qc.is_right_choice",
	).From("question_choices qc").Where(sq.Eq{"qc.question_id": questionIDs})

	type QChoice struct {
		model.QuestionChoice
		QuestionID string `json:"question_id" db:"question_id"`
	}
	var qChoices []QChoice
	if err := qs.sqlStore.selectBuilder(qs.sqlStore.db, &qChoices, query); err != nil {
		return nil, errors.Wrapf(err, "can't get question choices for questions %v", questionIDs)
	}

	questionsMap := make(map[string]*model.Question, len(questions))
	for _, question := range questions {
		question.Choices = []model.QuestionChoice{}
		questionsMap[question.ID] = question
	}
	for _, choice := range qChoices {
		question, ok := questionsMap[choice.QuestionID]
		if !ok {
			qs.sqlStore.logger.Error("no answers for question", log.String("question_id", choice.QuestionID))
			continue
		}
		question.Choices = append(question.Choices, model.QuestionChoice{
			ID:            choice.ID,
			Choice:        choice.Choice,
			IsRightChoice: choice.IsRightChoice,
		})
	}

	return questions, nil
}

// Delete removes question
func (qs *SQLQuestionStore) Delete(question *model.Question) error {
	curTime := model.GetMillis()

	_, err := qs.sqlStore.execBuilder(qs.sqlStore.db, qs.sqlStore.builder.
		Update("questions").
		SetMap(map[string]interface{}{
			"deleted_at": curTime,
		}).
		Where(sq.Eq{"id": question.ID}))
	if err != nil {
		return errors.Wrapf(err, "failed to delete question with id '%s'", question.ID)
	}

	return nil
}
