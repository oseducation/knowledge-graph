package config

import (
	"encoding/json"
	"io"
	"os"

	"github.com/pkg/errors"
)

type ServerSettings struct {
	SiteURL                         string
	ListenAddress                   string
	KnowledgeGraphImportURL         string
	SessionIdleTimeoutInMinutes     int
	ExtendSessionLengthWithActivity bool
	SessionLengthInMinutes          int
	CookieDomain                    string //Can be configured for each environment
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

func ReadConfig() (*Config, error) {
	configFile, err := os.Open("config/config.json")
	if err != nil {
		return nil, errors.Wrap(err, "can't open config.json")
	}
	defer configFile.Close()
	byteValue, err := io.ReadAll(configFile)
	if err != nil {
		return nil, errors.Wrap(err, "can't read config.json")
	}
	var config Config
	if err := json.Unmarshal(byteValue, &config); err != nil {
		return nil, errors.Wrap(err, "can't unmarshal config.json")
	}

	return &config, nil
}
