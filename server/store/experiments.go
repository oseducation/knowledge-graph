package store

import (
	"github.com/oseducation/knowledge-graph/model"
	"github.com/pkg/errors"
)

type ExperimentsStore interface {
	Save(experiment *model.ExperimentUser) (*model.ExperimentUser, error)
}

// SQLExperimentsStore is a struct to store experiments
type SQLExperimentsStore struct {
	sqlStore *SQLStore
}

// NewExperimentsStore creates a new store for experiments.
func NewExperimentsStore(db *SQLStore) ExperimentsStore {
	return &SQLExperimentsStore{
		sqlStore: db,
	}
}

// Save saves an experiment in the DB
func (es *SQLExperimentsStore) Save(experiment *model.ExperimentUser) (*model.ExperimentUser, error) {
	if experiment.ID != "" {
		return nil, errors.New("invalid input")
	}
	experiment.BeforeSave()
	if err := experiment.IsValid(); err != nil {
		return nil, err
	}

	_, err := es.sqlStore.execBuilder(es.sqlStore.db, es.sqlStore.builder.
		Insert("experiment_users").
		SetMap(map[string]interface{}{
			"id":     experiment.ID,
			"email":  experiment.Email,
			"source": experiment.Source,
		}))
	if err != nil {
		return nil, errors.Wrapf(err, "can't save experiment user with email:%s", experiment.Email)
	}
	return experiment, nil
}
