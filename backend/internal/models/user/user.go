package user

import "codeberg.org/narukoshin/new-filemanager/internal/models/role"

// Profile contains a user's public profile attributes.
type Profile struct {
	// Username is the user's unique display and login name.
	Username string `json:"username"`
	// Role determines the user's authorization level.
	Role role.Role `json:"role"`
}

// User represents a persisted user account.
type User struct {
	// ID uniquely identifies the user.
	ID int64 `json:"id"`

	Profile

	// Password_hash stores the user's password hash and is omitted from JSON.
	Password_hash string `json:"-"`
	// Disabled indicates whether the account is disabled.
	Disabled bool `json:"disabled"`
	// CreatedAt is the time at which the account was created.
	CreatedAt string `json:"created_at"`
	// UpdatedAt is the time at which the account was last updated.
	UpdatedAt string `json:"updated_at"`
}

// CreateUserRequest contains the fields accepted when creating a user.
type CreateUserRequest struct {
	Profile
	// Password is the new user's plaintext password.
	Password string `json:"password"`
}

type UpdateUserRequest struct {
	Profile
	Password string `json:"password"`
	Disabled bool `json:"disabled"`
}