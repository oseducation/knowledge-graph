package model

// NodeGetOptions for getting and filtering nodes
type NodeGetOptions struct {
	// TermInName searches term in names
	TermInName string
	// TermInDescription searches term in descriptions
	TermInDescription string
	// Page
	Page int
	// Page size
	PerPage int
	// Include deleted
	IncludeDeleted bool
}

type NodeGetOption func(*NodeGetOptions)

func ComposeNodeOptions(opts ...NodeGetOption) NodeGetOption {
	return func(options *NodeGetOptions) {
		for _, f := range opts {
			f(options)
		}
	}
}

func TermInName(termInName string) NodeGetOption {
	return func(args *NodeGetOptions) {
		args.TermInName = termInName
	}
}

func TermInDescription(termInDescription string) NodeGetOption {
	return func(args *NodeGetOptions) {
		args.TermInDescription = termInDescription
	}
}

func NodePage(page int) NodeGetOption {
	return func(args *NodeGetOptions) {
		args.Page = page
	}
}

func NodePerPage(perPage int) NodeGetOption {
	return func(args *NodeGetOptions) {
		args.PerPage = perPage
	}
}

func NodeDeleted(deleted bool) NodeGetOption {
	return func(args *NodeGetOptions) {
		args.IncludeDeleted = deleted
	}
}
