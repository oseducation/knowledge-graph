package app

func (a *App) HandleStripeWebhook(payload []byte, signature string) error {
	return a.Services.StripeService.HandleCustomerWebhook(payload, signature)
}
