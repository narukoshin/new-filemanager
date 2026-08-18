package api

import (
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
	"codeberg.org/narukoshin/new-filemanager/internal/requestctx"
	"codeberg.org/narukoshin/new-filemanager/internal/services/users"
	"github.com/labstack/echo/v5"
	"net/http"
)

// Users provides user-related HTTP handlers.
type Users struct {
	service *users.Service
}

// NewUsers creates user handlers backed by service.
func NewUsers(service *users.Service) *Users {
	return &Users{service: service}
}

// CreateUser creates a new user.
func (h *Users) CreateUser(ctx *echo.Context) error {
	reqctx := requestctx.New(ctx.Request().Context())
	logging.Logger.Debug().Msg("Received a request to create a new user")
	var req user.CreateUserRequest
	// bind the request body
	if err := ctx.Bind(&req); err != nil {
		return requestctx.With(reqctx).
			Status(http.StatusBadRequest).
			Message("invalid request body").
			Response(ctx, nil)
	}
	// validate the request
	createdUser, err := h.service.CreateUser(
		reqctx,
		&req,
	)
	if err != nil {
		return requestctx.With(reqctx).
			Fallback(http.StatusBadRequest, "invalid request").
			Response(ctx, nil)
	}
	return ctx.JSON(http.StatusCreated, createdUser)
}

// GetUsers returns all users.
func (h *Users) GetUsers(ctx *echo.Context) error {
	reqctx := requestctx.New(ctx.Request().Context())
	logging.Logger.Debug().Msg("Received a request to get all users")
	userList, err := h.service.GetUsers(reqctx)
	if err != nil {
		return requestctx.With(reqctx).
			Fallback(
				http.StatusInternalServerError,
				"failed to get users",
			).
			Response(ctx, nil)
	}
	return requestctx.With(reqctx).
		Response(ctx, userList)
}

func (h *Users) GetUserById(ctx *echo.Context) error {
	reqctx := requestctx.New(ctx.Request().Context())
	logging.Logger.Debug().Msg("Received a request to get a user by id")
	userId := ctx.Param("userid")
	user, err := h.service.GetUserById(reqctx, userId)
	if err != nil {
		return requestctx.With(reqctx).
			Fallback(
				http.StatusInternalServerError,
				"failed to get user",
			).
			Response(ctx, nil)
	}
	return requestctx.With(reqctx).
		Response(ctx, user)
}

func (h *Users) DeleteUser(ctx *echo.Context) error {
	reqctx := requestctx.New(ctx.Request().Context())
	logging.Logger.Debug().Msg("Received a request to delete a user")
	userId := ctx.Param("userid")
	err := h.service.DeleteUser(reqctx, userId)
	if err != nil {
		return requestctx.With(reqctx).
			Fallback(
				http.StatusInternalServerError,
				"failed to delete user",
			).
			Response(ctx, nil)
	}
	// returning 204 code without body
	return ctx.NoContent(http.StatusNoContent)
}

func (h *Users) UpdateUser(ctx *echo.Context) error {
	reqctx := requestctx.New(ctx.Request().Context())
	logging.Logger.Debug().Msg("Received a request to update a user")
	userId := ctx.Param("userid")
	var req user.UpdateUserRequest
	if err := ctx.Bind(&req); err != nil {
		return requestctx.With(reqctx).
			Status(http.StatusBadRequest).
			Message("invalid request body").
			Response(ctx, nil)
	}
	updatedUser, err := h.service.UpdateUser(
		reqctx,
		userId,
		&req,
	)
	if err != nil {
		return requestctx.With(reqctx).
			Fallback(
				http.StatusInternalServerError,
				"failed to update user",
			).Response(ctx, nil)
	}
	return ctx.JSON(http.StatusOK, updatedUser)
}
