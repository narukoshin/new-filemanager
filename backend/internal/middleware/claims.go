package middleware

import (
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	authservice "codeberg.org/narukoshin/new-filemanager/internal/services/auth"
	"github.com/golang-jwt/jwt/v5"
	"errors"
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
		return "", errors.New("unauthorized")
	}
	return claims.Subject, nil
}

func GetClaims(ctx *echo.Context) (*authservice.TokenClaims, error) {
	token, err := echo.ContextGet[*jwt.Token](ctx, "user")
	if err != nil {
		logging.Logger.Debug().Msg(err.Error())
		return nil, echo.ErrUnauthorized.Wrap(err)
	}
	claims, ok := token.Claims.(*authservice.TokenClaims)

	if !ok || claims.Subject == "" {
		return nil, errors.New("unauthorized")
	}
	return claims, nil
}