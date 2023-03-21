package model

type Config struct {
	RequireEmailVerification bool
	FeedbackName             string
	FeedbackEmail            string
	ReplyToAddress           string
	SMTPHost                 string
	SMTPPort                 int
	SMTPUser                 string
	SMTPPassword             string
}
