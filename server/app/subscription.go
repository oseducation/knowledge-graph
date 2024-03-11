package app

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"
)

const stripeWebHookSecretEnvVar = "STRIPE_WEBHOOK_SECRET"

func (a *App) GetPlans() ([]*stripe.Price, error) {
	prices, error := a.Services.StripeService.GetPlans()
	if error != nil {
		return nil, errors.Wrap(error, "getPlans")
	}
	return prices, nil
}

func (a *App) HandleWebhook(payload []byte, signature string) error {
	stripeWebHookSecret, ok := os.LookupEnv(stripeWebHookSecretEnvVar)
	if !ok {
		return errors.New("stripe webhook key is not set")
	}

	event, err := webhook.ConstructEvent(payload, signature, stripeWebHookSecret)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error verifying webhook signature: %v\n", err)
		return errors.Wrap(err, "bad signature")
	}

	switch event.Type {
	case "customer.created":
		err := a.customerCreatedEvent(&event)
		if err != nil {
			return errors.Wrap(err, "Error creating customer")
		}
	case "customer.deleted":
		err := a.customerCreatedEvent(&event)
		if err != nil {
			return errors.Wrap(err, "Error deleting customer")
		}
	case "customer.updated":
		err := a.customerUpdatedEvent(&event)
		if err != nil {
			return errors.Wrap(err, "Error updating customer")
		}
	case "customer.subscription.created":
		err := a.customerSubscriptionCreatedEvent(&event)
		if err != nil {
			return errors.Wrap(err, "Error creating subscription")
		}

	case "customer.subscription.updated":
		err := a.customerSubscriptionUpdatedEvent(&event)
		if err != nil {
			return errors.Wrap(err, "Error updating subscription")
		}
		// customer.subscription.created
		// data.object is a subscription
		// Occurs whenever a customer is signed up for a new plan.

		// customer.subscription.deleted
		// data.object is a subscription
		// Occurs whenever a customer’s subscription ends.

		// customer.subscription.paused
		// data.object is a subscription
		// Occurs whenever a customer’s subscription is paused. Only applies when subscriptions enter status=paused, not when payment collection is paused.

		// customer.subscription.pending_update_applied
		// data.object is a subscription
		// Occurs whenever a customer’s subscription’s pending update is applied, and the subscription is updated.

		// customer.subscription.pending_update_expired
		// data.object is a subscription
		// Occurs whenever a customer’s subscription’s pending update expires before the related invoice is paid.

		// customer.subscription.resumed
		// data.object is a subscription
		// Occurs whenever a customer’s subscription is no longer paused. Only applies when a status=paused subscription is resumed, not when payment collection is resumed.

		// customer.subscription.trial_will_end
		// data.object is a subscription
		// Occurs three days before a subscription’s trial period is scheduled to end, or when a trial is ended immediately (using trial_end=now).

		// customer.subscription.updated
		// data.object is a subscription
		// Occurs whenever a subscription changes (e.g., switching from one plan to another, or changing the status from trial to active).
	default:
		log.Printf("Unhandled event type: %s\n", event.Type)
	}

	return nil
}

func (a *App) customerCreatedEvent(event *stripe.Event) error {
	var customer stripe.Customer
	err := json.Unmarshal(event.Data.Raw, &customer)
	if err != nil {
		return errors.Wrap(err, "Error parsing webhook JSON")
	}

	_, err = a.Store.Customer().Save(&model.Customer{
		CustomerID: customer.ID,
		Email:      customer.Email,
		CreatedAt:  customer.Created,
	})
	if err != nil {
		return errors.Wrap(err, "Error saving customer to database")
	}
	log.Printf("Customer was created! %v\n", customer)

	return nil
}

func (a *App) customerUpdatedEvent(event *stripe.Event) error {
	var customer stripe.Customer
	err := json.Unmarshal(event.Data.Raw, &customer)
	if err != nil {
		return errors.Wrap(err, "Error parsing webhook JSON")
	}

	_, err = a.Store.Customer().Update(&model.Customer{
		CustomerID: customer.ID,
		Email:      customer.Email,
		CreatedAt:  customer.Created,
	})
	if err != nil {
		return errors.Wrap(err, "Error updating customer")
	}
	log.Printf("Customer was updated! %v\n", customer)

	return nil
}

// func (a *App) customerDeletedEvent(event *stripe.Event) error {
// 	var customer stripe.Customer
// 	err := json.Unmarshal(event.Data.Raw, &customer)
// 	if err != nil {
// 		return errors.Wrap(err, "Error parsing webhook JSON")
// 	}

// 	_, err = a.Store.Customer().Delete(&model.Customer{
// 		CustomerID: customer.ID,
// 		Email:      customer.Email,
// 		CreatedAt:  customer.Created,
// 	})
// 	if err != nil {
// 		return errors.Wrap(err, "Error deleting customer from database")
// 	}
// 	log.Printf("Customer was deleted! %v\n", customer)

// 	return nil
// }

func (a *App) customerSubscriptionCreatedEvent(event *stripe.Event) error {
	var subscription stripe.Subscription
	err := json.Unmarshal(event.Data.Raw, &subscription)
	if err != nil {
		return errors.Wrap(err, "Error parsing webhook JSON")
	}
	log.Printf("Subscription was created! %v\n", subscription)

	_, err = a.Store.Subscription().Save(&model.Subscription{
		ID:         subscription.ID,
		CustomerID: subscription.Customer.ID,
		CreatedAt:  subscription.Created,
		PlanID:     subscription.Items.Data[0].Price.ID,
		Status:     string(subscription.Status),
	})
	if err != nil {
		return errors.Wrap(err, "Error saving subscription to database")
	}
	return nil
}

func (a *App) customerSubscriptionUpdatedEvent(event *stripe.Event) error {
	var subscription stripe.Subscription
	err := json.Unmarshal(event.Data.Raw, &subscription)
	if err != nil {
		return errors.Wrap(err, "Error parsing webhook JSON")
	}
	log.Printf("Subscription was updated! %v\n", subscription)

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
	return nil
}
