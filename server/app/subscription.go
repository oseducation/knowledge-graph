package app

import "github.com/oseducation/knowledge-graph/log"

func (a *App) HandleStripeWebhook(payload []byte, signature string) error {
	err := a.Services.StripeService.HandleCustomerWebhook(payload, signature)
	if err != nil {
		a.Log.Error("Error handling stripe webhook", log.Err(err))
		return err
	}
	return nil
}
