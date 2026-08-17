package api

import (
	"codeberg.org/narukoshin/new-filemanager/internal/database"
	"codeberg.org/narukoshin/new-filemanager/internal/users"
	"github.com/labstack/echo/v5"
)

// Users provides user-related API operations backed by a database.
type Users struct {
	db      *database.Database
	service *users.Service
}

// NewUsers creates a Users API backed by db.
func NewUsers(service *users.Service) *Users {
	return &Users{service: service}
}

// CreateUser creates a new user.
func (h *Users) CreateUser(c *echo.Context) error {
	return nil
}
