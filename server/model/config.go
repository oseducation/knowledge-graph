package model

type ServerSettings struct {
	SiteURL       string
	ListenAddress string
}

type DBSettings struct {
	DriverName                  string
	DataSource                  string
	MaxIdleConns                int
	ConnMaxLifetimeMilliseconds int
	ConnMaxIdleTimeMilliseconds int
	MaxOpenConns                int
	QueryTimeout                int
}

type EmailSettings struct {
	RequireEmailVerification bool
	FeedbackName             string
	FeedbackEmail            string
	ReplyToAddress           string
	SMTPHost                 string
	SMTPPort                 int
	SMTPUser                 string
	SMTPPassword             string
}

type PasswordSettings struct {
	MinimumLength int
	Lowercase     bool
	Number        bool
	Uppercase     bool
	Symbol        bool
}

type Config struct {
	ServerSettings   ServerSettings
	DBSettings       DBSettings
	EmailSettings    EmailSettings
	PasswordSettings PasswordSettings
}
