package users

import "errors"

var (
	// ErrUsernameRequired indicates that a username was not provided.
	ErrUsernameRequired = errors.New("username is required")
	// ErrPasswordRequired indicates that a password was not provided.
	ErrPasswordRequired = errors.New("password is required")
	// ErrRoleRequired indicates that a role was not provided.
	ErrRoleRequired = errors.New("role is required")
	// ErrInvalidRole indicates that the requested role is not supported.
	ErrInvalidRole = errors.New("invalid role")
	// ErrUsernameExists indicates that the username is already in use.
	ErrUsernameExists = errors.New("username already exists")
	// ErrNoUsers indicates that no users were found.
	ErrNoUsers = errors.New("no users found")
)
