package services

import (
	"github.com/oseducation/knowledge-graph/config"
	"github.com/oseducation/knowledge-graph/log"
	"github.com/oseducation/knowledge-graph/store"
)

type Services struct {
	YoutubeService  YoutubeServiceInterface
	ChatGPTService  ChatGPTServiceInterface
	PineconeService PineconeServiceInterface
	StripeService   StripeServiceInterface
	EmailService    EmailServiceInterface
}

func NewServices(st store.Store, config config.EmailSettings, logger *log.Logger) (*Services, error) {
	chatGPTService, err := NewCHhatGPTService()
	if err != nil {
		return nil, err
	}
	youtubeService, err := NewYoutubeService()
	if err != nil {
		return nil, err
	}
	pineconeService, err := NewPineconeService()
	if err != nil {
		return nil, err
	}
	stripeService, err := NewStripeService(st, logger)
	if err != nil {
		return nil, err
	}

	return &Services{
		ChatGPTService:  chatGPTService,
		YoutubeService:  youtubeService,
		PineconeService: pineconeService,
		StripeService:   stripeService,
		EmailService:    NewEmailService(config),
	}, nil
}
