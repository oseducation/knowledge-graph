package app

import (
	"fmt"
	"time"

	"github.com/oseducation/knowledge-graph/model"
	"github.com/oseducation/knowledge-graph/services"
	"github.com/pkg/errors"
)

const (
	minimalEmbeddingScore = 0.5
	numberOfSimilarTopics = 3

	numberOfDialoguePosts = 10

	ShowVideoIntent                = "show_video"
	ShotTextIntent                 = "show_text"
	QuestionOnCurrentTopicIntent   = "question_on_current_topic"
	QuestionOnDifferentTopicIntent = "question_on_different_topic"
	QuestionOnOffTopicIntent       = "question_on_off_topic"
	DialogueIntent                 = "dialogue"

	offTopicString = "This topic is not included in the course, but you can ask any questions on the topic in progress!"
)

type UserIntent struct {
	Intent    string
	TopicID   string
	PrevPosts []*model.Post
}

func (a *App) AskQuestion(userPost *model.Post) (string, error) {
	posts, err := a.Store.Post().GetPosts(&model.PostGetOptions{
		UserID: userPost.UserID,
	})
	if err != nil {
		return "", errors.Wrapf(err, "userPost = %v", userPost)
	}
	if len(posts) == 0 {
		return "Welcome to the Knowledge Graph!", nil
	}
	return "You have a new post!", nil
}

func (a *App) CreateFirstPost(oldPosts []*model.Post, userID string) (*model.Post, error) {
	user, err := a.Store.User().Get(userID)
	if err != nil {
		return nil, errors.Wrapf(err, "can't get user = %v", userID)
	}
	user.Sanitize()

	message := ""
	var options []model.Option
	if len(oldPosts) == 0 {
		message = fmt.Sprintf(`👋 Hello %s, and welcome to Vitsi AI! I'm your AI tutor, here to help you learn programming and navigate the world of code. 🚀
You might know nothing about coding, but it's OK. You'll start coding in minutes. In fact, our first goal will be to write our first program.
Feel free to ask any questions, and let's make your coding journey exciting and fruitful! 🎉`, user.FirstName)

		options = []model.Option{{
			ID:                "1",
			TextOnButton:      "Let's start!",
			MessageAfterClick: "Great, Let's start with the next topic!",
			Action:            model.PostActionTypeNextTopic,
		}}
	} else {
		lastPostDate := oldPosts[len(oldPosts)-1].UpdatedAt
		timePassed := model.GetMillis() - lastPostDate
		if timePassed > 7*24*time.Hour.Milliseconds() { // more than 7 days
			message = fmt.Sprintf(`🎉 Welcome back %s! It’s great to see you again. I hope everything is going well! 🌟
If you’re ready to dive back into learning, I’m here to help you pick up right where you left off or explore new topics. Just let me know what you’d like to focus on today. And remember, no question is too small — I’m here to support you on your coding journey! 💻✨
If there’s anything specific you’d like to review or learn next, please tell me, or we can continue with the next topic in your learning path. Let’s get coding! 🚀`, user.FirstName)
			options = []model.Option{{
				ID:                "1",
				TextOnButton:      "Let's continue!",
				MessageAfterClick: "Let's continue with the next topic!",
				Action:            model.PostActionTypeNextTopic,
			}, {
				ID:                "2",
				TextOnButton:      "Set A Different Goal!",
				MessageAfterClick: "Let's set a different goal!",
				Action:            model.PostActionTypeLink,
				Link:              "/dashboard/goals",
			}}
		} else if timePassed > 24*time.Hour.Milliseconds() { // more than a day
			message = fmt.Sprintf(`👋 Welcome back %s! It’s fantastic to see you continuing your coding journey today. Consistency is key to mastering programming, and you’re doing great! 🎉
Let’s keep the momentum going! If you’re ready to dive back in, I can help you pick up where we left off, or if there’s something specific you’d like to focus on, feel free to let me know. Your progress is impressive, and I’m here to support you every step of the way. 💪
What would you like to work on today? Let’s make the most out of this session! 🚀`, user.FirstName)
			options = []model.Option{{
				ID:                "1",
				TextOnButton:      "Let's continue!",
				MessageAfterClick: "Let's continue with the topic in progress!",
				Action:            model.PostActionTypeNextTopic,
			}}
		} else if timePassed > time.Hour.Milliseconds() { // more than 1 hours
			message = `🚀 Welcome back! It's great to see you so dedicated to learning. Your focus and determination are truly commendable! 👏
You're on the right track, and I'm here to help you keep the momentum going. Whether you'd like to continue with the previous topic, tackle a new challenge, or need clarification on anything, just let me know. Together, we can make every coding session count! 💻✨`
			options = []model.Option{{
				ID:                "1",
				TextOnButton:      "Let's continue!",
				MessageAfterClick: "Let's continue with the topic in progress!",
				Action:            model.PostActionTypeNextTopic,
			}}
		} else if timePassed > 5*time.Minute.Milliseconds() { // more than 5 minutes
			message = `Let's continue with the topics in progress!`
			options = []model.Option{{
				ID:                "1",
				TextOnButton:      "OK!",
				MessageAfterClick: "OK!",
				Action:            model.PostActionTypeNextTopic,
			}}
		} else {
			return nil, nil
		}
	}

	post, err := a.CreatePost(&model.Post{
		LocationID: fmt.Sprintf("%s_%s", userID, model.BotID),
		UserID:     model.BotID,
		Message:    message,
		PostType:   model.PostTypeWithActions,
		Props: map[string]interface{}{
			"options": options,
		},
	})
	if err != nil {
		return nil, errors.Wrapf(err, "can't create post")
	}

	return post, nil
}

func (a *App) CheckLimit(userID string) bool {
	now := time.Now()
	beginningOfTheMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location()).UnixNano() / int64(time.Millisecond)
	count, err := a.CountChatGPTPosts(userID, beginningOfTheMonth)
	if err != nil {
		a.Log.Error(err.Error())
		return false
	}

	return count < a.Config.ChatSettings.ChatGPTMonthlyLimit
}

func (a *App) CountChatGPTPosts(userID string, after int64) (int, error) {
	locationID := fmt.Sprintf("%s_%s", userID, model.BotID)

	options := &model.PostGetOptions{}
	model.ComposePostOptions(
		model.PostLocationID(locationID),
		model.PostUserID(model.BotID),
		model.PostType(model.PostTypeChatGPT),
		model.PostAfter(after),
		model.PostPage(-1),
		model.PostPerPage(-1))(options)
	count, err := a.Store.Post().CountPosts(options)
	if err != nil {
		return 0, errors.Wrapf(err, "can't count posts with options = %v", options)
	}
	return count, nil
}

func (a *App) AskQuestionToChatGPT(message, nodeID, userID string, gptModel services.ChatGPTModel) (*model.Post, error) {
	systemMessage, err := a.getSystemMessage(nodeID, userID)
	if err != nil {
		return nil, err
	}
	answer, err := a.Services.ChatGPTService.Send(userID, systemMessage, gptModel, []string{message})
	if err != nil {
		return nil, errors.Wrapf(err, "can't send message to chatGPT")
	}

	post, err := a.Store.Post().Save(&model.Post{
		LocationID: fmt.Sprintf("%s_%s", userID, model.BotID),
		UserID:     model.BotID,
		Message:    answer,
		PostType:   model.PostTypeChatGPT,
		Props:      map[string]interface{}{"node_id": nodeID},
	})

	return post, err
}

func (a *App) getPrerequisiteNodes(nodeID string) ([]*model.Node, error) {
	prerequisites, ok := a.Graph.Prerequisites[nodeID]
	if !ok {
		return []*model.Node{}, nil
	}

	nodes, err := a.Store.Node().GetNodesWithIDs(prerequisites)
	if err != nil || len(nodes) != len(prerequisites) {
		return nil, errors.Wrapf(err, "can't get nodes with ids = %v", prerequisites)
	}
	return nodes, nil
}

func (a *App) getSystemMessage(nodeID, userID string) (string, error) {
	nodes, err := a.getPrerequisiteNodes(nodeID)
	if err != nil {
		return "", err
	}

	node, err := a.Store.Node().Get(nodeID) // TODO: include nodeID in prerequisites to reduce db fetch
	if err != nil {
		return "", errors.Wrapf(err, "can't get node with id = %v", nodeID)
	}

	topics := ""
	for _, node := range nodes {
		topics += fmt.Sprintf("Topic: %s\nDescription: %s\n", node.Name, node.Description)
	}

	textOptions := &model.TextGetOptions{}
	model.ComposeTextOptions(
		model.TextNodeID(nodeID),
		model.TextPage(0),
		model.TextPerPage(1),
	)(textOptions)
	texts, err := a.Store.Text().GetTexts(textOptions) // TODO: include in a single db fetch
	if err != nil {
		return "", errors.Wrap(err, "can't get texts")
	}

	text := ""
	if len(texts) > 0 {
		text = texts[0].Text
	}
	content := fmt.Sprintf("Topic: %s\nDescription: %s\nContent: %s", node.Name, node.Description, text)

	tutorPersonalityPrompt := a.getTutorPrompt(userID)
	systemMessage := fmt.Sprintf(`%s. Assume that students knows all the topics listed in braces:
{%s}
Use the content below to answer the question:
{%s}
`, tutorPersonalityPrompt, topics, content)
	return systemMessage, nil
}

func (a *App) AskQuestionToChatGPTSteam(message, nodeID, userID string, gptModel services.ChatGPTModel) (services.ChatStream, error) {
	systemMessage, err := a.getSystemMessage(nodeID, userID)
	if err != nil {
		return nil, err
	}
	return a.Services.ChatGPTService.SendStream(userID, systemMessage, gptModel, []string{message})
}

func (a *App) GetResponseToCorrectAnswerStream(explanation string, userID string, gptModel services.ChatGPTModel) (services.ChatStream, error) {
	tutorPersonalityPrompt := a.getTutorPrompt(userID)
	systemMessage := fmt.Sprintf("%s. Learner correctly answered to the multiple choice question. Here is the explanation of the question: {%s}. Congratulate and explain the correct answer to the learner.", tutorPersonalityPrompt, explanation)
	message := ""
	return a.Services.ChatGPTService.SendStream(userID, systemMessage, gptModel, []string{message})
}

func (a *App) GetResponseToIncorrectAnswerStream(question *model.Question, incorrectAnswer, userID string, gptModel services.ChatGPTModel) (services.ChatStream, error) {
	tutorPersonalityPrompt := a.getTutorPrompt(userID)
	correctAnswer := ""
	for _, choice := range question.Choices {
		if choice.IsRightChoice {
			correctAnswer = choice.Choice
			break
		}
	}
	systemMessage := fmt.Sprintf("%s. Learner incorrectly answered to the multiple choice question. They question was: {%s}. They answered: {%s}. They should have answered: {%s}. Here is the explanation of the correct answer: {%s}. State that the learner answered incorrectly, explain to the learner why they might have answered incorrectly, state the correct answer and explain why it is the correct answer. Be concise.", tutorPersonalityPrompt, question.Question, incorrectAnswer, correctAnswer, question.Explanation)
	message := ""
	return a.Services.ChatGPTService.SendStream(userID, systemMessage, gptModel, []string{message})
}

func (a *App) AskQuestionToChatGPTSteamOnTopicDialogue(message, nodeID, userID string, gptModel services.ChatGPTModel, prevPosts []*model.Post) (services.ChatStream, error) {
	systemMessage, err := a.getSystemMessage(nodeID, userID)
	if err != nil {
		return nil, err
	}
	chatMessages := []services.ChatMessage{{
		Role:    services.ChatGPTModelRoleSystem,
		Content: systemMessage,
	}}
	for _, post := range prevPosts {
		if post.UserID == userID {
			chatMessages = append(chatMessages, services.ChatMessage{Content: post.Message, Role: services.ChatGPTModelRoleUser})
		} else if post.UserID == model.BotID {
			chatMessages = append(chatMessages, services.ChatMessage{Content: post.Message, Role: services.ChatGPTModelRoleAssistant})
		}
	}
	chatMessages = append(chatMessages, services.ChatMessage{Content: message, Role: services.ChatGPTModelRoleUser})
	return a.Services.ChatGPTService.SendStreamWithChatMessages(userID, gptModel, chatMessages)
}

func (a *App) AskQuestionToChatGPTSteamOnDifferentTopic(message, nodeID, userID string, gptModel services.ChatGPTModel) (services.ChatStream, error) {
	statuses, err := a.Store.Node().GetNodesForUser(userID)
	if err != nil {
		return nil, err
	}
	for _, status := range statuses {
		if status.NodeID == nodeID && (status.Status == model.NodeStatusFinished || status.Status == model.NodeStatusStarted || status.Status == model.NodeStatusWatched) {
			return a.AskQuestionToChatGPTSteam(message, nodeID, userID, gptModel)
		}
	}

	node, err := a.Store.Node().Get(nodeID)
	if err != nil {
		return nil, errors.Wrapf(err, "can't get node with id = %v", nodeID)
	}
	answer := fmt.Sprintf("It seems like you're asking a question about a different topic. You will cover this when we reach the topic named **`%s`**. Meanwhile, you can ask any question on the topic in progress!", node.Name)

	return services.CreateStringStream(answer), nil
}

func (a *App) AskQuestionToChatGPTSteamOffTopic() (services.ChatStream, error) {
	return services.CreateStringStream(offTopicString), nil
}

func (a *App) GetUserIntent(text, userID string, currentNodeID string) (UserIntent, error) {
	currentNode, err := a.Store.Node().Get(currentNodeID)
	if err != nil {
		return UserIntent{}, errors.Wrap(err, "can't get current node")
	}

	vector, err := a.Services.ChatGPTService.GetEmbedding(text, userID)
	if err != nil {
		return UserIntent{}, errors.Wrap(err, "can't get embedding")
	}

	topics, err := a.Services.PineconeService.Query(numberOfSimilarTopics, vector)
	if err != nil || len(topics) == 0 {
		return UserIntent{}, errors.Wrap(err, "can't get pinecone response")
	}

	for _, topic := range topics {
		if topic.Name == currentNode.Name && topic.Score > minimalEmbeddingScore {
			return UserIntent{TopicID: currentNodeID, Intent: QuestionOnCurrentTopicIntent}, nil
		}
	}

	// Do we have user intent?
	if topics[0].Score >= minimalEmbeddingScore {
		if topics[0].Intent == ShowVideoIntent || topics[0].Intent == ShotTextIntent {
			return UserIntent{Intent: topics[0].Intent}, nil
		} else if topics[0].Intent != "" {
			return UserIntent{}, errors.New("unknown intent from pinecone response")
		} else if topics[0].Intent == "" {
			node, err2 := a.Store.Node().GetByName(topics[0].Name)
			if err2 != nil {
				return UserIntent{}, errors.Wrapf(err2, "can't get node with name = %v", topics[0].Name)
			}
			return UserIntent{TopicID: node.ID, Intent: QuestionOnDifferentTopicIntent}, nil
		}
	}

	// Do we have off-topic intent?
	posts, err := a.getLastNDialoguePosts(userID, numberOfDialoguePosts)
	if err != nil {
		return UserIntent{Intent: QuestionOnOffTopicIntent}, nil
	}
	// if len(posts) == 0 {
	// 	return UserIntent{Intent: QuestionOnOffTopicIntent}, nil
	// }
	// gptMessages := a.getGPTMessages(posts)
	// messagesEmbedding, err := a.Services.ChatGPTService.GetEmbedding(gptMessages, userID)
	// if err != nil {
	// 	return UserIntent{Intent: QuestionOnOffTopicIntent, PrevPosts: posts}, nil
	// }
	// score := dotProduct(vector, messagesEmbedding)
	// if score < minimalEmbeddingScore {
	// 	return UserIntent{Intent: QuestionOnOffTopicIntent, PrevPosts: posts}, nil
	// }
	return UserIntent{Intent: DialogueIntent, PrevPosts: posts}, nil
}

func (a *App) getLastNDialoguePosts(userID string, n int) ([]*model.Post, error) {
	posts, err := a.Store.Post().GetLastNPostsForLocation(n, fmt.Sprintf("%s_%s", userID, model.BotID))
	if err != nil {
		return nil, nil
	}

	dialoguePosts := []*model.Post{}
	for _, post := range posts {
		if post.Message == offTopicString {
			continue
		} else if post.PostType == model.PostTypeTopic {
			break
		}
		dialoguePosts = append([]*model.Post{post}, dialoguePosts...)
	}
	return dialoguePosts, nil
}

// func (a *App) getGPTMessages(posts []*model.Post) string {
// 	message := ""
// 	for _, post := range posts {
// 		if post.Message == offTopicString || post.PostType != model.PostTypeChatGPT {
// 			continue
// 		}
// 		message += post.Message + "\n"
// 	}
// 	return message
// }

func (a *App) getTutorPrompt(userID string) string {
	tutorPersonality, err := a.Store.Preferences().Get(userID, "tutor_personality")
	if err != nil {
		return model.StandardTutorPersonality.Prompt
	}
	for _, personality := range model.DefaultTutorPersonalities {
		if personality.ID == tutorPersonality {
			return personality.Prompt
		}
	}
	return model.StandardTutorPersonality.Prompt
}

// // Function to calculate the dot product of two vectors
// func dotProduct(vectorA, vectorB []float32) float32 {
// 	sum := float32(0.0)
// 	for i := range vectorA {
// 		sum += vectorA[i] * vectorB[i]
// 	}
// 	return sum
// }
