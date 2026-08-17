package user

import "codeberg.org/narukoshin/new-filemanager/internal/models/role"

type Profile struct {
	Username string    `json:"username"`
	Role     role.Role `json:"role"`
}

type User struct {
	ID int64 `json:"id"`

	Profile

	Password_hash string `json:"-"`
	Disabled      bool   `json:"disabled"`
	CreatedAt     string `json:"created_at"`
	UpdatedAt     string `json:"updated_at"`
}

type CreateUserRequest struct {
	Profile
	Password string `json:"password"`
}
