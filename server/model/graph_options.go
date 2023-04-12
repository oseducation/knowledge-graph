package model

// EdgeGetOptions for getting and filtering edges
type EdgeGetOptions struct {
	// If not empty FromNodeID searches edges coming from `FromNodeID`
	FromNodeID string
	// If not empty ToNodeID searches edges going to `ToNodeID`
	ToNodeID string
	// Page
	Page int
	// Page size
	PerPage int
}

type EdgeGetOption func(*EdgeGetOptions)

func ComposeEdgeOptions(opts ...EdgeGetOption) EdgeGetOption {
	return func(options *EdgeGetOptions) {
		for _, f := range opts {
			f(options)
		}
	}
}

func FromNodeID(fromNodeID string) EdgeGetOption {
	return func(args *EdgeGetOptions) {
		args.FromNodeID = fromNodeID
	}
}

func ToNodeID(toNodeID string) EdgeGetOption {
	return func(args *EdgeGetOptions) {
		args.ToNodeID = toNodeID
	}
}

func EdgePage(page int) EdgeGetOption {
	return func(args *EdgeGetOptions) {
		args.Page = page
	}
}

func EdgePerPage(perPage int) EdgeGetOption {
	return func(args *EdgeGetOptions) {
		args.PerPage = perPage
	}
}
