package jwt

import (
	"context"
	"time"

	"errors"

	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type TokenClaims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
}

type JwtConfig struct {
	Secret  []byte
	Context context.Context
	User    *user.User
}

func New(
	secret []byte,
	context context.Context,
	user *user.User,
) *JwtConfig {
	return &JwtConfig{
		Secret:  secret,
		Context: context,
		User:    user,
	}
}

// just a generic errors to all my issues
// easy isnt it
var errUnauthorized = errors.New("unauthorized")

func (s *JwtConfig) GenerateToken() (string, error) {
	now := time.Now()
	claims := TokenClaims{
		Role: s.User.Role.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer: "filemanager",
			// this is jti - a unique identifier for the token
			// i have no idea why they called it ID but okay i guess
			ID:        uuid.New().String(),
			Subject:   s.User.UUID,
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Hour * 24)),
			NotBefore: jwt.NewNumericDate(now),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.Secret)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func ValidateClaims(token *jwt.Token) (*TokenClaims, error) {
	claims, ok := token.Claims.(*TokenClaims)

	if !ok || claims.Subject == "" {
		return nil, errUnauthorized
	}

	if claims.ExpiresAt == nil {
		return nil, errUnauthorized
	}

	if claims.ExpiresAt.Before(time.Now()) {
		return nil, errUnauthorized
	}

	return claims, nil
}
