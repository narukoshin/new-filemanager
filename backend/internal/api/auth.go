package api

import (
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/middleware"
	authmd "codeberg.org/narukoshin/new-filemanager/internal/models/auth"
	"codeberg.org/narukoshin/new-filemanager/internal/requestctx"
	"codeberg.org/narukoshin/new-filemanager/internal/services/auth"
	"github.com/labstack/echo/v5"
	"strings"
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
	token, err := h.service.Login(reqctx, req)
	if err != nil {
		return requestctx.With(reqctx).
			Fallback(http.StatusInternalServerError, "failed to login").
			Response(ctx, nil)
	}
	return requestctx.With(reqctx).
		Status(http.StatusOK).
		Response(ctx, map[string]string{"token": token})
}

func (h *Auth) GetMe(ctx *echo.Context) error {
	reqctx := requestctx.New(ctx.Request().Context())
	uuid, err := middleware.UserUUID(ctx)
	if err != nil {
		logging.Logger.Debug().Msg(err.Error())
		return requestctx.With(reqctx).
			Fallback(http.StatusUnauthorized, "unauthorized").
			Response(ctx, nil)
	}
	user, err := h.service.GetUserByUUID(reqctx, uuid)
	if err != nil {
		return requestctx.With(reqctx).
			Fallback(http.StatusInternalServerError, "failed to get user").
			Response(ctx, nil)
	}

	return requestctx.With(reqctx).
		Status(http.StatusOK).
		Response(ctx, user)
}

func (h *Auth) Logout(ctx *echo.Context) error {
	reqctx := requestctx.New(ctx.Request().Context())

	claims, err := middleware.GetClaims(ctx)
	if err != nil {
		return requestctx.With(reqctx).
			Fallback(http.StatusUnauthorized, "unauthorized").
			Response(ctx, nil)
	}

	revokedToken := authmd.RevokedToken{
		Jti: strings.TrimSpace(claims.ID),
		RevokedAt: claims.ExpiresAt.Time,
	}

	err = h.service.Logout(reqctx, revokedToken)
	if err != nil {
		logging.Logger.Debug().Msg(err.Error())
		return requestctx.With(reqctx).
			Fallback(http.StatusInternalServerError, "failed to logout").
			Response(ctx, nil)
	}

	return requestctx.With(reqctx).
		Status(http.StatusOK).
		Response(ctx, nil)
}