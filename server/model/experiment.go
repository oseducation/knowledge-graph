package model

import (
	"encoding/json"
	"io"

	"github.com/pkg/errors"
)

const (
	CalculusExperimentID   = "calculus"
	JavascriptExperimentID = "javascript"
	EngineerExperimentID   = "engineer"
	ManagementExperimentID = "management"
)

// ExperimentUser type defines a potential user who was interested in the experiment
type ExperimentUser struct {
	ID     string `json:"id" db:"id"`
	Email  string `json:"email" db:"email"`
	Source string `json:"source" db:"source"`
}

// IsValid validates the experiment user.
func (e *ExperimentUser) IsValid() error {
	if !IsValidID(e.ID) {
		return invalidVideoError("", "id", e.ID)
	}

	if !IsValidEmail(e.Email) {
		return invalidExperimentError(e.ID, "email", e.Email)
	}

	if e.Source != CalculusExperimentID &&
		e.Source != JavascriptExperimentID &&
		e.Source != EngineerExperimentID &&
		e.Source != ManagementExperimentID {
		return invalidExperimentError(e.ID, "source", e.Source)
	}

	return nil
}

// BeforeSave should be called before storing the experiment user
func (e *ExperimentUser) BeforeSave() {
	e.ID = NewID()
}

// ExperimentFromJSON will decode the input and return an experiment user
func ExperimentFromJSON(data io.Reader) (*ExperimentUser, error) {
	var eUser *ExperimentUser
	if err := json.NewDecoder(data).Decode(&eUser); err != nil {
		return nil, errors.Wrap(err, "can't decode experimentUser")
	}
	return eUser, nil
}

func invalidExperimentError(experimentUserID, fieldName string, fieldValue any) error {
	return errors.Errorf("invalid experimentUser error. experimentUserID=%s %s=%v", experimentUserID, fieldName, fieldValue)
}
