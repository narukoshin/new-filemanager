package api

import (
	authmd "codeberg.org/narukoshin/new-filemanager/internal/models/auth"
	"codeberg.org/narukoshin/new-filemanager/internal/requestctx"
	"codeberg.org/narukoshin/new-filemanager/internal/services/auth"
	"github.com/labstack/echo/v5"
	"net/http"
)

type Auth struct {
	service *auth.Service
}

func NewAuth(service *auth.Service) *Auth {
	return &Auth{service: service}
}

func (h *Auth) Login(ctx *echo.Context) error {
	reqctx := requestctx.New(ctx.Request().Context())
	var req authmd.AuthLoginRequest
	if err := ctx.Bind(&req); err != nil {
		return requestctx.With(reqctx).
			Status(http.StatusBadRequest).
			Message("invalid request body").
			Response(ctx, nil)
	}
	// validate the request
	if err := ctx.Validate(&req); err != nil {
		return requestctx.With(reqctx).
			Fallback(http.StatusBadRequest, "invalid request").
			Response(ctx, nil)
	}

	// login the user
	err := h.service.Login(reqctx, req)
	if err != nil {
		return requestctx.With(reqctx).
			Fallback(http.StatusInternalServerError, "failed to login").
			Response(ctx, nil)
	}
	return nil
}
