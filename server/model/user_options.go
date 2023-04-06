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
}

type UserGetOption func(*UserGetOptions)

func ComposeOptions(opts ...UserGetOption) UserGetOption {
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

func Page(page int) UserGetOption {
	return func(args *UserGetOptions) {
		args.Page = page
	}
}

func PerPage(perPage int) UserGetOption {
	return func(args *UserGetOptions) {
		args.PerPage = perPage
	}
}

func Deleted(deleted bool) UserGetOption {
	return func(args *UserGetOptions) {
		args.IncludeDeleted = deleted
	}
}
