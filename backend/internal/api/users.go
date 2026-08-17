package api

import (
	"codeberg.org/narukoshin/new-filemanager/internal/database"
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
	"codeberg.org/narukoshin/new-filemanager/internal/users"
	"github.com/labstack/echo/v5"
	"net/http"
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
func (h *Users) CreateUser(ctx *echo.Context) error {
	logging.Logger.Debug().Msg("Received a request to create a new user")
	var req user.CreateUserRequest
	// bind the request body
	if err := ctx.Bind(&req); err != nil {
		return errorResponse(ctx, http.StatusBadRequest, "Invalid request body")
	}
	// validate the request
	createdUser, err := h.service.CreateUser(
		ctx.Request().Context(),
		&req,
	)
	if err != nil {
		return errorResponse(ctx, http.StatusBadRequest, err.Error())
	}
	return ctx.JSON(201, createdUser)
}
