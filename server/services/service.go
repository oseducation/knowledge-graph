package services

type Services struct {
	YoutubeService YoutubeServiceInterface
	ChatGPTService ChatGPTServiceInterface
	StripeService  StripeServiceInterface
}

func NewServices() (*Services, error) {
	chatGPTService, err := NewCHhatGPTService()
	if err != nil {
		return nil, err
	}
	youtubeService, err := NewYoutubeService()
	if err != nil {
		return nil, err
	}

	stripeService, err := NewStripeService()
	if err != nil {
		return nil, err
	}

	return &Services{
		ChatGPTService: chatGPTService,
		YoutubeService: youtubeService,
		StripeService:  stripeService,
	}, nil
}
