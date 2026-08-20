package middleware

import (
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	authservice "codeberg.org/narukoshin/new-filemanager/internal/services/auth"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v5"
)

func UserUUID(ctx *echo.Context) (string, error) {
	token, err := echo.ContextGet[*jwt.Token](ctx, "user")
	if err != nil {
		logging.Logger.Debug().Msg(err.Error())
		return "", echo.ErrUnauthorized.Wrap(err)
	}
	claims, ok := token.Claims.(*authservice.TokenClaims)

	if !ok || claims.Subject == "" {
		return "", echo.ErrUnauthorized.Wrap(err)
	}
	return claims.Subject, nil
}
