package services

import (
	"fmt"
	"os"

	"github.com/pkg/errors"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/customer"
)

const stripeAPIKey = "STRIPE_API_KEY"

type StripeService struct {
	apiKey string
}

type StripeServiceInterface interface {
	CreateCustomer(email string) (*stripe.Customer, error)
}

func NewStripeService() (StripeServiceInterface, error) {
	stripeAPIKey, ok := os.LookupEnv(stripeAPIKey)
	if !ok {
		return nil, errors.New("stripe api key is not set")
	}
	return &StripeService{apiKey: stripeAPIKey}, nil
}

func (s *StripeService) CreateCustomer(email string) (*stripe.Customer, error) {
	stripe.Key = s.apiKey
	params := &stripe.CustomerParams{
		Email: stripe.String(email),
		// 	Description: stripe.String("My First Test Customer (created for API docs)"),
	}

	c, ok := customer.New(params)
	fmt.Println(c)
	return c, ok
}
