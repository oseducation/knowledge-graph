package app

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/mail"
	"net/url"
	"strings"

	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
	"gopkg.in/gomail.v2"
)

func (a *App) sendWelcomeEmail(userID string, email string, verified bool, siteURL string) error {
	subject := "Welcome to vitsi.ai"
	body := "You've joined vitsi.ai\n"

	if !verified && a.Config.EmailSettings.RequireEmailVerification {
		body += "Please verify your email address by clicking below.\n"
		token, err := a.createVerifyEmailToken(userID, email)
		if err != nil {
			return err
		}
		link := fmt.Sprintf("%s/do_verify_email?token=%s&email=%s", siteURL, token.Token, url.QueryEscape(email))
		body += "<a href=\"" + link + "\">Verify Email</a>\n"
	}

	if err := a.sendMail(email, subject, body); err != nil {
		return errors.Wrapf(err, "can't send email to %s", email)
	}
	return nil
}

func (a *App) sendMail(email, subject, body string) error {
	fromMail := mail.Address{Name: a.Config.EmailSettings.FeedbackName, Address: a.Config.EmailSettings.FeedbackEmail}
	replyTo := mail.Address{Name: a.Config.EmailSettings.FeedbackName, Address: a.Config.EmailSettings.ReplyToAddress}

	m := gomail.NewMessage()
	m.SetHeader("From", fromMail.String())
	m.SetHeader("To", email)
	m.SetHeader("Subject", subject)
	m.SetHeader("Reply-To", replyTo.String())
	m.SetBody("text/html", body)

	d := gomail.NewDialer(a.Config.EmailSettings.SMTPHost, a.Config.EmailSettings.SMTPPort, a.Config.EmailSettings.SMTPUser, a.Config.EmailSettings.SMTPPassword)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}
	if err := d.DialAndSend(m); err != nil {
		return errors.Wrapf(err, "can't send email to - %s", email)
	}
	return nil
}

func (a *App) createVerifyEmailToken(userID string, newEmail string) (*model.Token, error) {
	tokenExtra := struct {
		UserID string
		Email  string
	}{
		userID,
		newEmail,
	}
	jsonData, err := json.Marshal(tokenExtra)

	if err != nil {
		return nil, errors.Wrapf(err, "can't create email verification token for user - %s with email - %s", userID, newEmail)
	}

	token := model.NewToken(model.TokenTypeVerifyEmail, string(jsonData))

	if err := a.Store.Token().Save(token); err != nil {
		return nil, err
	}

	return token, nil
}

// VerifyEmailFromToken verifies if token is correct one for email
func (a *App) VerifyEmailFromToken(token string) error {
	tok, err := a.Store.Token().Get(token)
	if err != nil {
		return errors.Wrap(err, "VerifyEmailFromToken")
	}
	if tok.Type != model.TokenTypeVerifyEmail {
		return errors.New("wrong token type")
	}
	if model.GetMillis()-tok.CreatedAt > model.MaxTokenExpireTime {
		return errors.New("link is expired")
	}

	tokenData := struct {
		UserID string
		Email  string
	}{}

	err2 := json.Unmarshal([]byte(tok.Extra), &tokenData)
	if err2 != nil {
		return errors.New("error in token extra data")
	}

	user, err := a.Store.User().Get(tokenData.UserID)
	if err != nil {
		return err
	}

	tokenData.Email = strings.ToLower(tokenData.Email)
	if strings.ToLower(user.Email) != tokenData.Email {
		return errors.New("wrong email") //TODO change email?
	}

	user.EmailVerified = true
	if err := a.Store.User().Update(user); err != nil {
		return errors.Wrap(err, "VerifyEmailFromToken")

	}

	if err := a.Store.Token().Delete(token); err != nil {
		return errors.Wrap(err, "VerifyEmailFromToken")
	}
	return nil
}
