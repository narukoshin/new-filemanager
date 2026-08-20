package auth

import (
	"context"
	"time"

	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
	"github.com/golang-jwt/jwt/v5"
)

func (s *Service) GenerateToken(ctx context.Context, user *user.User) (string, error) {
	now := time.Now()
	claims := TokenClaims{
		Role: user.Role.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "filemanager",
			Subject:   user.UUID,
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Hour * 24)),
			NotBefore: jwt.NewNumericDate(now),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}
