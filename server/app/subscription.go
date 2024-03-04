package app

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"
)

func (a *App) GetPlans() ([]*stripe.Price, error) {
	prices, error := a.Services.StripeService.GetPlans()
	if error != nil {
		return nil, errors.Wrap(error, "getPlans")
	}
	return prices, nil
}

func (a *App) HandleWebhook(payload []byte, signature string) error {
	const endpointSecret = "whsec_5b6584a5371e4c995b179fbd16d324d667f8bdc4f6846557aaebdf6e14030b0d"

	event, err := webhook.ConstructEvent(payload, signature, endpointSecret)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error verifying webhook signature: %v\n", err)
		return errors.Wrap(err, "bad signature")
	}

	switch event.Type {
	case "payment_intent.succeeded":
		var paymentIntent stripe.PaymentIntent
		err := json.Unmarshal(event.Data.Raw, &paymentIntent)
		if err != nil {
			return errors.Wrap(err, "Error parsing webhook JSON")
		}
		fmt.Printf("PaymentIntent was successful! %v\n", paymentIntent)
	case "customer.created":
		var customer stripe.Customer
		err := json.Unmarshal(event.Data.Raw, &customer)
		if err != nil {
			return errors.Wrap(err, "Error parsing webhook JSON")
		}
		fmt.Printf("Customer was created! %v\n", customer)

		_, err = a.Store.Customer().Save(&model.Customer{
			CustomerID: customer.ID,
			Email:      customer.Email,
			CreatedAt:  customer.Created,
		})
		if err != nil {
			return errors.Wrap(err, "Error creating customer")
		}
	case "customer.subscription.created":
		var subscription stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription)
		if err != nil {
			return errors.Wrap(err, "Error parsing webhook JSON")
		}
		fmt.Printf("Subscription was created! %v\n", subscription)

		_, err = a.Store.Subscription().Save(&model.Subscription{
			ID:         subscription.ID,
			CustomerID: subscription.Customer.ID,
			CreatedAt:  subscription.Created,
			PlanID:     subscription.Items.Data[0].Price.ID,
			Status:     string(subscription.Status),
		})
		if err != nil {
			return errors.Wrap(err, "Error creating subscription")
		}
	case "customer.subscription.updated":
		var subscription stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription)
		if err != nil {
			return errors.Wrap(err, "Error parsing webhook JSON")
		}
		fmt.Printf("Subscription was updated! %v\n", subscription)

		_, err = a.Store.Subscription().Update(&model.Subscription{
			ID:         subscription.ID,
			CustomerID: subscription.Customer.ID,
			CreatedAt:  subscription.Created,
			PlanID:     subscription.Items.Data[0].Price.ID,
			Status:     string(subscription.Status),
		})
		if err != nil {
			return errors.Wrap(err, "Error updating subscription")
		}
	default:
		fmt.Fprintf(os.Stderr, "Unhandled event type: %s\n", event.Type)
	}

	return nil
}
