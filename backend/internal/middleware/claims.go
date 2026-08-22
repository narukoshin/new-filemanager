package middleware

import (
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	jwts "codeberg.org/narukoshin/new-filemanager/internal/security/jwt"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v5"
)

func UserUUID(ctx *echo.Context) (string, error) {
	claims, err := GetClaims(ctx)
	if err != nil {
		return "", err
	}
	return claims.Subject, nil
}

func GetClaims(ctx *echo.Context) (*jwts.TokenClaims, error) {
	token, err := echo.ContextGet[*jwt.Token](ctx, "user")
	if err != nil {
		logging.Logger.Debug().Msg(err.Error())
		return nil, echo.ErrUnauthorized.Wrap(err)
	}

	claims, err := jwts.ValidateClaims(token)
	if err != nil {
		return nil, err
	}

	return claims, nil
}
