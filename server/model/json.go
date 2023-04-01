package model

import (
	"encoding/json"
	"io"
)

// MapFromJSON will decode the key/value pair map
func MapFromJSON(data io.Reader) map[string]string {
	decoder := json.NewDecoder(data)

	var objmap map[string]string
	if err := decoder.Decode(&objmap); err != nil {
		return make(map[string]string)
	}
	return objmap
}
