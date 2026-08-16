package api

import (
	"codeberg.org/narukoshin/new-filemanager/internal/database"
)

// Users is the API for managing users.
type Users struct {
	db *database.Database
}

func NewUsers(db *database.Database) *Users {
	return &Users{db: db}
}
