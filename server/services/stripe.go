package services

import (
	"database/sql"
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
	case "checkout.session.completed":
		err := ss.customerCheckoutSessionCompleted(&event)
		if err != nil {
			return errors.Wrap(err, "Error in checkout session completed")
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

	ss.logger.Info("Customer was created!", log.String("customer", fmt.Sprintf("%v", string(event.Data.Raw))))
	savedCustomer, err := ss.db.Customer().Get(customer.ID)
	if err != nil && errors.Cause(err) != sql.ErrNoRows {
		return errors.Wrapf(err, "Error getting customer(%s) from db while creating one", customer.ID)
	}
	if errors.Cause(err) == sql.ErrNoRows {
		_, err = ss.db.Customer().Save(&model.Customer{
			CustomerID: customer.ID,
			Email:      customer.Email,
			CreatedAt:  customer.Created,
			DeletedAt:  0,
		})
		if err != nil {
			return errors.Wrap(err, "Error saving customer to database")
		}
	} else if savedCustomer.Email != customer.Email {
		_, err = ss.db.Customer().Update(&model.Customer{
			CustomerID: customer.ID,
			Email:      customer.Email,
			CreatedAt:  savedCustomer.CreatedAt,
			DeletedAt:  0,
			UserID:     savedCustomer.UserID,
		})
		if err != nil {
			return errors.Wrap(err, "Error updating customer")
		}
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

	email := savedCustomer.Email
	if customer.Email != "" {
		email = customer.Email
	}

	_, err = ss.db.Customer().Update(&model.Customer{
		CustomerID: customer.ID,
		Email:      email,
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

	savedSub, err := ss.db.Customer().GetSubscription(subscription.ID)
	if err != nil && errors.Cause(err) != sql.ErrNoRows {
		return errors.Wrap(err, "Error getting subscription from db")
	}
	if errors.Cause(err) == sql.ErrNoRows {
		_, err = ss.db.Customer().SaveSubscription(&model.Subscription{
			ID:                 subscription.ID,
			CustomerID:         subscription.Customer.ID,
			CreatedAt:          subscription.Created,
			PlanID:             subscription.Items.Data[0].Price.ID,
			Status:             string(subscription.Status),
			TriggeredByEventAt: event.Created,
		})
		if err != nil {
			return errors.Wrap(err, "Error saving subscription to database")
		}
	} else {
		if savedSub.TriggeredByEventAt > event.Created {
			ss.logger.Info("Subscription was already created!", log.String("subscription", fmt.Sprintf("%v", subscription)))
			return nil
		}
		if (savedSub.TriggeredByEventAt == event.Created &&
			savedSub.Status != string(subscription.Status) &&
			string(subscription.Status) == "active") ||
			(savedSub.TriggeredByEventAt < event.Created) {
			if savedSub.Status != string(subscription.Status) && string(subscription.Status) == "active" {
				_, err = ss.db.Customer().UpdateSubscription(&model.Subscription{
					ID:                 subscription.ID,
					CustomerID:         subscription.Customer.ID,
					CreatedAt:          subscription.Created,
					PlanID:             subscription.Items.Data[0].Price.ID,
					Status:             string(subscription.Status),
					TriggeredByEventAt: event.Created,
				})
				if err != nil {
					return errors.Wrap(err, "Error updating subscription with the save event_at")
				}
			}
		}
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

	savedSub, err := ss.db.Customer().GetSubscription(subscription.ID)
	if err != nil && errors.Cause(err) != sql.ErrNoRows {
		return errors.Wrap(err, "Error getting subscription from db")
	}
	if errors.Cause(err) == sql.ErrNoRows {
		_, err = ss.db.Customer().UpdateSubscription(&model.Subscription{
			ID:                 subscription.ID,
			CustomerID:         subscription.Customer.ID,
			CreatedAt:          subscription.Created,
			PlanID:             subscription.Items.Data[0].Price.ID,
			Status:             string(subscription.Status),
			TriggeredByEventAt: event.Created,
		})
		if err != nil {
			return errors.Wrap(err, "Error updating subscription")
		}
	} else {
		if savedSub.TriggeredByEventAt > event.Created {
			ss.logger.Info("Subscription was already updated!", log.String("subscription", fmt.Sprintf("%v", subscription)))
			return nil
		}
		if (savedSub.TriggeredByEventAt == event.Created &&
			savedSub.Status != string(subscription.Status) &&
			string(subscription.Status) == "active") ||
			(savedSub.TriggeredByEventAt < event.Created) {
			if savedSub.Status != string(subscription.Status) && string(subscription.Status) == "active" {
				_, err = ss.db.Customer().UpdateSubscription(&model.Subscription{
					ID:                 subscription.ID,
					CustomerID:         subscription.Customer.ID,
					CreatedAt:          subscription.Created,
					PlanID:             subscription.Items.Data[0].Price.ID,
					Status:             string(subscription.Status),
					TriggeredByEventAt: event.Created,
				})
				if err != nil {
					return errors.Wrap(err, "Error updating subscription with the same event_at")
				}
			}
		}
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

func (ss *stripeService) customerCheckoutSessionCompleted(event *stripe.Event) error {
	var session stripe.CheckoutSession
	err := json.Unmarshal(event.Data.Raw, &session)
	if err != nil {
		return errors.Wrap(err, "Error parsing webhook JSON for subscription")
	}
	customer, err := ss.db.Customer().Get(session.Customer.ID)
	if err != nil && errors.Cause(err) != sql.ErrNoRows {
		return errors.Wrap(err, "Error getting customer from db")
	}
	if errors.Cause(err) == sql.ErrNoRows {
		customer, err = ss.db.Customer().Save(&model.Customer{
			CustomerID: session.Customer.ID,
			Email:      session.Customer.Email,
			CreatedAt:  model.GetMillis(),
			DeletedAt:  0,
			UserID:     session.ClientReferenceID,
		})
		if err != nil {
			return errors.Wrap(err, "Error saving customer to database")
		}
	} else {
		email := customer.Email
		if session.Customer.Email != "" {
			email = session.Customer.Email
		}
		customer, err = ss.db.Customer().Update(&model.Customer{
			CustomerID: session.Customer.ID,
			Email:      email,
			CreatedAt:  customer.CreatedAt,
			DeletedAt:  0,
			UserID:     session.ClientReferenceID,
		})
		if err != nil {
			return errors.Wrap(err, "Error updating customer")
		}
	}

	ss.logger.Info("Customer checkout completed!", log.String("customer", fmt.Sprintf("%v", customer)))

	return nil
}
