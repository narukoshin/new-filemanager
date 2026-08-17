package users

import "errors"

var (
	errUsernameRequired = errors.New("username is required")
	errPasswordRequired = errors.New("password is required")
	errRoleRequired     = errors.New("role is required")
	errInvalidRole      = errors.New("invalid role")
	errUsernameExists   = errors.New("username already exists")
)
