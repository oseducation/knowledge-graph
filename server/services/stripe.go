package services

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/model"
	"github.com/oseducation/knowledge-graph/store"
	"github.com/pkg/errors"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"
)

const (
	stripeAPIKey                = "STRIPE_API_KEY"
	stripeCustomerWebhookSecret = "STRIPE_CUSTOMER_WEBHOOK_SECRET"
)

type stripeService struct {
	apiKey                string
	customerWebhookSecret string
	db                    store.Store
	logger                *log.Logger
}

type stripeServiceDummy struct {
}

type StripeServiceInterface interface {
	HandleCustomerWebhook(payload []byte, signature string) error
}

func NewStripeService(st store.Store, logger *log.Logger) (StripeServiceInterface, error) {
	key, ok := os.LookupEnv(stripeAPIKey)
	if !ok {
		return nil, errors.New("stripe api key is not set")
	}
	if key == "" || key == "test" {
		return &stripeServiceDummy{}, nil
	}
	secret, ok := os.LookupEnv(stripeCustomerWebhookSecret)
	if !ok {
		return nil, errors.New("stripe customer webhook secret is not set")
	}
	if secret == "" || secret == "test" {
		return &stripeServiceDummy{}, nil
	}

	stripe.Key = key
	return &stripeService{apiKey: key, customerWebhookSecret: secret, logger: logger, db: st}, nil
}

func (ss *stripeService) HandleCustomerWebhook(payload []byte, signature string) error {
	event, err := webhook.ConstructEvent(payload, signature, ss.customerWebhookSecret)
	if err != nil {
		ss.logger.Error("Error verifying webhook signature", log.Err(err))
		return errors.Wrap(err, "bad signature")
	}

	switch event.Type {
	case "customer.created":
		err := ss.customerCreatedEvent(&event)
		if err != nil {
			return errors.Wrap(err, "Error creating customer")
		}
	case "customer.updated":
		err := ss.customerUpdatedEvent(&event)
		if err != nil {
			return errors.Wrap(err, "Error updating customer")
		}
	case "customer.deleted":
		err := ss.customerDeletedEvent(&event)
		if err != nil {
			return errors.Wrap(err, "Error deleting customer")
		}
	case "customer.subscription.created":
		err := ss.customerSubscriptionCreatedEvent(&event)
		if err != nil {
			return errors.Wrap(err, "Error creating subscription")
		}

	case "customer.subscription.updated":
		err := ss.customerSubscriptionUpdatedEvent(&event)
		if err != nil {
			return errors.Wrap(err, "Error updating subscription")
		}
	case "customer.subscription.deleted":
		err := ss.customerSubscriptionDeletedEvent(&event)
		if err != nil {
			return errors.Wrap(err, "Error deleting subscription")
		}
	default:
		ss.logger.Warn("Unhandled event type", log.String("type", fmt.Sprintf("%v", event.Type)), log.String("event", fmt.Sprintf("%v", event)))
	}

	return nil
}

func (ssd *stripeServiceDummy) HandleCustomerWebhook(_ []byte, _ string) error {
	return nil
}

func (ss *stripeService) customerCreatedEvent(event *stripe.Event) error {
	var customer stripe.Customer
	err := json.Unmarshal(event.Data.Raw, &customer)
	if err != nil {
		return errors.Wrap(err, "Error parsing webhook JSON")
	}

	_, err = ss.db.Customer().Save(&model.Customer{
		CustomerID: customer.ID,
		Email:      customer.Email,
		CreatedAt:  customer.Created,
		DeletedAt:  0,
	})
	if err != nil {
		return errors.Wrap(err, "Error saving customer to database")
	}
	ss.logger.Info("Customer was created!", log.String("customer", fmt.Sprintf("%v", customer)))

	return nil
}

func (ss *stripeService) customerUpdatedEvent(event *stripe.Event) error {
	var customer stripe.Customer
	err := json.Unmarshal(event.Data.Raw, &customer)
	if err != nil {
		return errors.Wrap(err, "Error parsing webhook JSON")
	}

	deletedAt := int64(0)
	if customer.Deleted {
		deletedAt = model.GetMillis()
	}

	savedCustomer, err := ss.db.Customer().Get(customer.ID)
	if err != nil {
		return errors.Wrapf(err, "Error getting customer(%s) from db while trying to update", customer.ID)
	}
	if savedCustomer.Email == customer.Email &&
		((savedCustomer.DeletedAt == 0 && !customer.Deleted) ||
			(savedCustomer.DeletedAt > 0 && customer.Deleted)) {
		ss.logger.Info("Nothing to update for the customer", log.String("customer", fmt.Sprintf("%v", customer)))
		return nil
	}

	_, err = ss.db.Customer().Update(&model.Customer{
		CustomerID: customer.ID,
		Email:      customer.Email,
		CreatedAt:  customer.Created,
		DeletedAt:  deletedAt,
	})
	if err != nil {
		return errors.Wrap(err, "Error updating customer")
	}
	ss.logger.Info("Customer was updated!", log.String("customer", fmt.Sprintf("%v", customer)))

	return nil
}

func (ss *stripeService) customerDeletedEvent(event *stripe.Event) error {
	var customer stripe.Customer
	err := json.Unmarshal(event.Data.Raw, &customer)
	if err != nil {
		return errors.Wrap(err, "Error parsing webhook JSON")
	}

	_, err = ss.db.Customer().Delete(&model.Customer{
		CustomerID: customer.ID,
	})
	if err != nil {
		return errors.Wrap(err, "Error deleting customer")
	}
	ss.logger.Info("Customer was deleted!", log.String("customer", fmt.Sprintf("%v", customer)))

	return nil
}

func (ss *stripeService) customerSubscriptionCreatedEvent(event *stripe.Event) error {
	var subscription stripe.Subscription
	err := json.Unmarshal(event.Data.Raw, &subscription)
	if err != nil {
		return errors.Wrap(err, "Error parsing webhook JSON")
	}

	_, err = ss.db.Customer().SaveSubscription(&model.Subscription{
		ID:         subscription.ID,
		CustomerID: subscription.Customer.ID,
		CreatedAt:  subscription.Created,
		PlanID:     subscription.Items.Data[0].Price.ID,
		Status:     string(subscription.Status),
	})
	if err != nil {
		return errors.Wrap(err, "Error saving subscription to database")
	}
	ss.logger.Info("Subscription was created!", log.String("subscription", fmt.Sprintf("%v", subscription)))

	return nil
}

func (ss *stripeService) customerSubscriptionUpdatedEvent(event *stripe.Event) error {
	var subscription stripe.Subscription
	err := json.Unmarshal(event.Data.Raw, &subscription)
	if err != nil {
		return errors.Wrap(err, "Error parsing webhook JSON")
	}

	_, err = ss.db.Customer().UpdateSubscription(&model.Subscription{
		ID:         subscription.ID,
		CustomerID: subscription.Customer.ID,
		CreatedAt:  subscription.Created,
		PlanID:     subscription.Items.Data[0].Price.ID,
		Status:     string(subscription.Status),
	})
	if err != nil {
		return errors.Wrap(err, "Error updating subscription")
	}
	ss.logger.Info("Subscription was updated!", log.String("subscription", fmt.Sprintf("%v", subscription)))

	return nil
}

func (ss *stripeService) customerSubscriptionDeletedEvent(event *stripe.Event) error {
	var subscription stripe.Subscription
	err := json.Unmarshal(event.Data.Raw, &subscription)
	if err != nil {
		return errors.Wrap(err, "Error parsing webhook JSON for subscription")
	}

	_, err = ss.db.Customer().DeleteSubscription(&model.Subscription{
		ID: subscription.ID,
	})
	if err != nil {
		return errors.Wrap(err, "Error deleting subscription")
	}
	ss.logger.Info("Subscription was deleted!", log.String("subscription", fmt.Sprintf("%v", subscription)))

	return nil
}
