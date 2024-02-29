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
		var customer model.Customer
		err := json.Unmarshal(event.Data.Raw, &customer)
		if err != nil {
			return errors.Wrap(err, "Error parsing webhook JSON")
		}
		fmt.Printf("Customer was created! %v\n", customer)

		_, err = a.CreateCustomer(&customer)
		if err != nil {
			return errors.Wrap(err, "Error creating customer")
		}
	default:
		fmt.Fprintf(os.Stderr, "Unhandled event type: %s\n", event.Type)
	}

	return nil
}

func (a *App) CreateCustomer(customer *model.Customer) (*model.Customer, error) {
	_, err := a.Store.Customer().Save(customer)
	if err != nil {
		return nil, errors.Wrapf(err, "useremail = %s", customer.Email)
	}
	return customer, nil
}
