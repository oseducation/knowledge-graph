package app

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strings"

	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

func (a *App) sendWelcomeEmail(userID string, email string, verified bool) error {
	subject := "Welcome to Vitsi AI"
	body := "You've joined Vitsi AI\n"

	if !verified && a.Config.EmailSettings.RequireEmailVerification {
		body += "Please verify your email address by clicking below.\n"
		token, err := a.createVerifyEmailToken(userID, email)
		if err != nil {
			return err
		}
		link := fmt.Sprintf("%s/do_verify_email?token=%s&email=%s", a.GetSiteURL(), token.Token, url.QueryEscape(email))
		body += "<a href=\"" + link + "\">Verify Email</a>\n"
	}

	if err := a.Services.EmailService.Send(email, subject, body); err != nil {
		return errors.Wrapf(err, "can't send email to %s", email)
	}
	return nil
}

func (a *App) SendPostToNodeNotificationEmail(post *model.Post) error {
	node, err := a.Store.Node().Get(post.LocationID)
	if err != nil {
		return errors.Wrapf(err, "can't get node")
	}
	user, err := a.Store.User().Get(post.UserID)
	if err != nil {
		return errors.Wrapf(err, "can't get user")
	}
	if err := a.sendNotificationEmail(node.Name, post.Message, user.Username, node.ID); err != nil {
		return errors.Wrapf(err, "can't send notification email")
	}
	return nil
}

func (a *App) sendNotificationEmail(nodeName, message, userName, nodeID string) error {
	subject := fmt.Sprintf("New message in %s", nodeName)
	body := fmt.Sprintf("New sent by %s\n <br/>", userName)
	url := a.GetSiteURL()
	body += fmt.Sprintf("Click here: %s/nodes/%s\n <br/>", url, nodeID)
	email := "win"
	body += message
	email += "eson"
	email += "@gmail.com"
	if err := a.Services.EmailService.Send(email, subject, body); err != nil {
		return errors.Wrapf(err, "can't send email to %s", email)
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

	err = a.Store.Token().Save(token)
	if err != nil {
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

func (a *App) SendPasswordResetEmail(email, token string) error {
	siteURL := a.GetSiteURL()
	link := fmt.Sprintf("%s/reset-password-complete?token=%s", siteURL, url.QueryEscape(token))
	title := "Reset Your Password"

	body := "Click the link below to reset your password. If you didn’t request this, you can safely ignore this email.\n <br/> The password reset link expires in 24 hours. \n <br/> <a href=\"" + link + "\">Reset Password</a>\n <br/>"
	return a.Services.EmailService.Send(email, title, body)
}
