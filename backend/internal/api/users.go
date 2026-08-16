package api

import (
	"codeberg.org/narukoshin/new-filemanager/internal/database"
)

// Users provides user-related API operations backed by a database.
type Users struct {
	db *database.Database
}

// NewUsers creates a Users API backed by db.
func NewUsers(db *database.Database) *Users {
	return &Users{db: db}
}
