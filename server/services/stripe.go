package services

import (
	"fmt"
	"os"

	"github.com/pkg/errors"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/customer"
	"github.com/stripe/stripe-go/v76/price"
)

const stripeAPIKey = "STRIPE_API_KEY"

type StripeService struct {
	apiKey string
}

type StripeServiceInterface interface {
	CreateCustomer(email string) (*stripe.Customer, error)
	GetPlans() ([]*stripe.Price, error)
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

// method to create a subscription
// func (s *StripeService) CreateSubscription(customerID string, priceID string) (*stripe.Subscription, error) {
// 	stripe.Key = s.apiKey
// 	params := &stripe.SubscriptionParams{
// 		Customer: stripe.String(customerID),
// 		Items: []*stripe.SubscriptionItemsParams{
// 			{
// 				Price: stripe.String(priceID),
// 			},
// 		},
// 	}
// 	subscription, err := stripe.Subscription.New(params)
// 	if err != nil {
// 		return nil, err
// 	}
// 	return subscription, nil
// }

//method to cancel a subscription
// func (s *StripeService) CancelSubscription(subscriptionID string) (*stripe.Subscription, error) {
// 	stripe.Key = s.apiKey
// 	params := &stripe.SubscriptionParams{
// 		CancelAtPeriodEnd: stripe.Bool(true),
// 	}
// 	subscription, err := subscription.Update(subscriptionID, params)
// 	if err != nil {
// 		return nil, err
// 	}
// 	return subscription, nil
// }

// method to upggrade subscription
// func (s *StripeService) UpgradeSubscription(subscriptionID string, newPriceID string) (*stripe.Subscription, error) {
// 	stripe.Key = s.apiKey
// 	params := &stripe.SubscriptionParams{
// 		Items: []*stripe.SubscriptionItemsParams{
// 			{
// 				ID:   stripe.String(subscriptionID),
// 				Price: stripe.String(newPriceID),
// 			},
// 		},
// 	}
// 	subscription, err := stripe.Subscription.Update(subscriptionID, params)
// 	if err != nil {
// 		return nil, err
// 	}
// 	return subscription, nil
// }

// method to retrieve a products plans
func (s *StripeService) GetPlans() ([]*stripe.Price, error) {
	stripe.Key = s.apiKey
	params := &stripe.PriceListParams{}
	params.Active = stripe.Bool(true)
	// params.Type = stripe.String("recurring")
	iter := price.List(params)
	plans := []*stripe.Price{}
	for iter.Next() {
		plans = append(plans, iter.Price())
	}
	return plans, nil
}

// get customer subscription
// func (s *StripeService) GetCustomerSubscription(customerID string) (*stripe.Subscription, error) {
// 	stripe.Key = s.apiKey
// 	params := &stripe.SubscriptionListParams{
// 		Customer: stripe.String(customerID),
// 	}
// 	iter := subscription.List(params)
// 	for iter.Next() {
// 		subscription := iter.Subscription()
// 		return subscription, nil
// 	}
// 	return nil, nil
// }
