package services

import (
	"context"
	"os"

	"github.com/pinecone-io/go-pinecone/pinecone"
	"github.com/pkg/errors"
)

const pineconeAPIKey = "PINECONE_API_KEY"
const pineconeIndexName = "vitsi-ai-first-index"

type pineconeService struct {
	apiKey     string
	pc         *pinecone.Client
	index      *pinecone.Index
	connection *pinecone.IndexConnection
}

type pineconeServiceDummy struct {
	apiKey string
}

type PineconeServiceInterface interface {
	Query(topK uint32, vector []float32) ([]TopicScores, error)
}

type TopicScores struct {
	Score float32
	Name  string
}

func NewPineconeService() (PineconeServiceInterface, error) {
	pineconeAPIKey, ok := os.LookupEnv(pineconeAPIKey)
	if !ok {
		return nil, errors.New("pinecone api key is not set")
	}
	if pineconeAPIKey == "" || pineconeAPIKey == "test" {
		return &pineconeServiceDummy{apiKey: pineconeAPIKey}, nil
	}
	pc, err := pinecone.NewClient(pinecone.NewClientParams{
		ApiKey: pineconeAPIKey,
	})
	if err != nil {
		return nil, errors.Wrap(err, "can't create pinecone client")
	}

	ctx := context.Background()
	idxs, err := pc.ListIndexes(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "can't list indexes")
	}
	for _, idx := range idxs {
		if idx.Name == pineconeIndexName {
			connection, err := pc.Index(idx.Host)
			if err != nil {
				return nil, errors.Wrap(err, "can't connect to index")
			}
			return &pineconeService{apiKey: pineconeAPIKey, pc: pc, index: idx, connection: connection}, nil
		}
	}

	return nil, errors.New("can't find index")
}

func (ps *pineconeService) Query(topK uint32, vector []float32) ([]TopicScores, error) {
	ctx := context.Background()
	resp, err := ps.connection.QueryByVectorValues(&ctx, &pinecone.QueryByVectorValuesRequest{
		Vector:          vector,
		TopK:            topK,
		IncludeValues:   false,
		IncludeMetadata: true,
	})
	if err != nil {
		return nil, errors.Wrap(err, "can't query by vector values")
	}
	topicScores := make([]TopicScores, 0, len(resp.Matches))
	for _, match := range resp.Matches {
		topicScores = append(topicScores, TopicScores{
			Score: match.Score,
			Name:  match.Vector.Metadata.Fields["name"].GetStringValue(),
		})
	}
	return topicScores, nil
}

func (psd *pineconeServiceDummy) Query(_ uint32, _ []float32) ([]TopicScores, error) {
	return []TopicScores{}, nil
}
