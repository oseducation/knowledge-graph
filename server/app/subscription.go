package app

import (
	"github.com/pkg/errors"
	"github.com/stripe/stripe-go/v76"
)

func (a *App) GetPlans() ([]*stripe.Price, error) {
	prices, error := a.Services.StripeService.GetPlans()
	if error != nil {
		return nil, errors.Wrap(error, "getPlans")
	}
	return prices, nil
}
