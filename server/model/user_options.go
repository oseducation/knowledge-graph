package model

// UserGetOptions for getting and filtering users
type UserGetOptions struct {
	// Term to search
	Term string
	// Page
	Page int
	// Page size
	PerPage int
	// Role
	Role RoleType
	// Include deleted
	IncludeDeleted bool
	// Include node count for in_progress and finished nodes
	WithNodeCount bool
}

type UserGetOption func(*UserGetOptions)

func ComposeUserOptions(opts ...UserGetOption) UserGetOption {
	return func(options *UserGetOptions) {
		for _, f := range opts {
			f(options)
		}
	}
}

func Term(term string) UserGetOption {
	return func(args *UserGetOptions) {
		args.Term = term
	}
}

func UserPage(page int) UserGetOption {
	return func(args *UserGetOptions) {
		args.Page = page
	}
}

func UserPerPage(perPage int) UserGetOption {
	return func(args *UserGetOptions) {
		args.PerPage = perPage
	}
}

func UserDeleted(deleted bool) UserGetOption {
	return func(args *UserGetOptions) {
		args.IncludeDeleted = deleted
	}
}

func WithNodeCount() UserGetOption {
	return func(args *UserGetOptions) {
		args.WithNodeCount = true
	}
}
