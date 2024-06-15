package model

// Edge is a representation of a graph edge stored in the DB
type Edge struct {
	FromNodeID string `json:"from_node_id" db:"from_node_id"`
	ToNodeID   string `json:"to_node_id" db:"to_node_id"`
}

// Graph is a representation of a Knowledge graph stored in the Memory
// Since querying a graph to find paths will need recursive queries
// we will store it in memory not to hit the DB too often.
type Graph struct {
	// key of the map is the nodeID, value of the map is list of all prerequisite nodeIDs
	Prerequisites map[string][]string
	Nodes         map[string]Node //TODO do we need this?
}

type FrontendNodes struct {
	ID          string `json:"nodeID"`
	Name        string `json:"name"`
	Description string `json:"description"`
	NodeType    string `json:"node_type"`
	Status      string `json:"status"`
	ParentID    string `json:"parent_id"`
}

type FrontendLinks struct {
	Source string `json:"sourceID"`
	Target string `json:"targetID"`
}

type FrontendGraph struct {
	Nodes []FrontendNodes `json:"nodes"`
	Links []FrontendLinks `json:"links"`
}
