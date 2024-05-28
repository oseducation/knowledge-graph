package services

import (
	"crypto/tls"
	"net/mail"
	"os"

	"github.com/oseducation/knowledge-graph/config"
	"github.com/pkg/errors"
	"gopkg.in/gomail.v2"
)

const emailKey = "SUPPORT_EMAIL_KEY"
const emailPasswordKey = "SUPPORT_EMAIL_PASSWORD_KEY"

type emailService struct {
	email    string
	password string
	config   config.EmailSettings
}

type EmailServiceInterface interface {
	Send(email, subject, body string) error
}

func NewEmailService(emailConfig config.EmailSettings) EmailServiceInterface {
	email, ok := os.LookupEnv(emailKey)
	if !ok {
		email = emailConfig.SMTPUser
	}
	password, ok := os.LookupEnv(emailPasswordKey)
	if !ok {
		password = emailConfig.SMTPPassword
	}

	return &emailService{email: email, password: password, config: emailConfig}
}

func (es *emailService) Send(email, subject, body string) error {
	fromMail := mail.Address{Name: es.config.FeedbackName, Address: es.config.FeedbackEmail}
	replyTo := mail.Address{Name: es.config.FeedbackName, Address: es.config.ReplyToAddress}

	m := gomail.NewMessage()
	m.SetHeader("From", fromMail.String())
	m.SetHeader("To", email)
	m.SetHeader("Subject", subject)
	m.SetHeader("Reply-To", replyTo.String())
	m.SetBody("text/html", body)

	d := gomail.NewDialer(es.config.SMTPHost, es.config.SMTPPort, es.email, es.password)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}
	if err := d.DialAndSend(m); err != nil {
		return errors.Wrapf(err, "can't send email to - %s", email)
	}
	return nil
}
