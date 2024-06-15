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
	GetIDByName(name string) (string, error)
	GetQuestions(options *model.QuestionGetOptions) ([]*model.Question, error)
	Delete(question *model.Question) error
	GetOnboardingQuestions(courseID string) ([][]*model.Question, error)
	SaveOnboardingQuestion(courseID, nodeID, questionID string, pos int) error
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
			"q.name",
			"q.question",
			"q.question_type",
			"q.node_id",
			"q.explanation",
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
			"name":          question.Name,
			"question":      question.Question,
			"question_type": question.QuestionType,
			"node_id":       question.NodeID,
			"explanation":   question.Explanation,
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

// GetIDByName gets question id by name
func (qs *SQLQuestionStore) GetIDByName(name string) (string, error) {
	var questionID string
	query := qs.sqlStore.builder.
		Select("q.id").
		From("questions q").
		Where(sq.Eq{"q.name": name})

	if err := qs.sqlStore.getBuilder(qs.sqlStore.db, &questionID, query); err != nil {
		return "", errors.Wrapf(err, "can't get question id by name: %s", name)
	}
	return questionID, nil
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

	return qs.populateQuestionsWithChoices(questions)
}

func (qs *SQLQuestionStore) populateQuestionsWithChoices(questions []*model.Question) ([]*model.Question, error) {
	questionIDs := make([]string, 0, len(questions))
	for _, question := range questions {
		questionIDs = append(questionIDs, question.ID)
	}

	query := qs.sqlStore.builder.Select(
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

func (qs *SQLQuestionStore) GetOnboardingQuestions(courseID string) ([][]*model.Question, error) {
	type OnboardingQuestion struct {
		CourseID   string `db:"course_id"`
		NodeID     string `db:"node_id"`
		QuestionID string `db:"question_id"`
		Pos        int    `db:"pos"`
	}

	questionSelect := qs.sqlStore.builder.
		Select(
			"oq.course_id",
			"oq.node_id",
			"oq.question_id",
			"oq.pos",
		).
		From("onboarding_questions oq").
		Where(sq.Eq{"oq.course_id": courseID}).OrderBy("oq.pos ASC")

	var questions []*OnboardingQuestion
	if err := qs.sqlStore.selectBuilder(qs.sqlStore.db, &questions, questionSelect); err != nil {
		return nil, errors.Wrap(err, "can't get onboarding question")
	}
	allQuestionsIDs := []string{}
	for _, question := range questions {
		allQuestionsIDs = append(allQuestionsIDs, question.QuestionID)
	}
	allQuestions, err := qs.getQuestionsFromIDs(allQuestionsIDs)
	if err != nil {
		return nil, err
	}
	allQuestions, err = qs.populateQuestionsWithChoices(allQuestions)
	if err != nil {
		return nil, err
	}

	allQuestionsMap := make(map[string]*model.Question, len(allQuestions))
	for _, question := range allQuestions {
		allQuestionsMap[question.ID] = question
	}

	questionIDs := [][]string{}
	for i, question := range questions {
		if i == 0 || questions[i-1].NodeID != question.NodeID {
			questionIDs = append(questionIDs, []string{})
		}
		questionIDs[len(questionIDs)-1] = append(questionIDs[len(questionIDs)-1], question.QuestionID)
	}

	onboardingQuestions := [][]*model.Question{}
	for i, ids := range questionIDs {
		onboardingQuestions = append(onboardingQuestions, []*model.Question{})
		for _, id := range ids {
			question, ok := allQuestionsMap[id]
			if !ok {
				return nil, errors.Wrapf(err, "missing questions in a map %s", id)
			}
			onboardingQuestions[i] = append(onboardingQuestions[i], question)
		}
	}

	return onboardingQuestions, nil
}

func (qs *SQLQuestionStore) SaveOnboardingQuestion(courseID, nodeID, questionID string, pos int) error {
	_, err := qs.sqlStore.execBuilder(qs.sqlStore.db, qs.sqlStore.builder.
		Insert("onboarding_questions").
		SetMap(map[string]interface{}{
			"course_id":   courseID,
			"node_id":     nodeID,
			"question_id": questionID,
			"pos":         pos,
		}))
	if err != nil {
		return errors.Wrapf(err, "can't save onboarding question for node: %s", nodeID)
	}
	return nil
}

func (qs *SQLQuestionStore) getQuestionsFromIDs(questionIDs []string) ([]*model.Question, error) {
	questionSelect := qs.sqlStore.builder.
		Select(
			"q.id",
			"q.name",
			"q.question",
			"q.question_type",
			"q.node_id",
			"q.explanation",
		).
		From("questions q").
		Where(sq.Eq{"q.id": questionIDs})

	var questions []*model.Question
	if err := qs.sqlStore.selectBuilder(qs.sqlStore.db, &questions, questionSelect); err != nil {
		return nil, errors.Wrap(err, "can't get questions from ids")
	}

	return questions, nil
}
