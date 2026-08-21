package auth

import (
	"context"
	"time"

	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
	"github.com/google/uuid"
	"github.com/golang-jwt/jwt/v5"
)

func (s *Service) GenerateToken(ctx context.Context, user *user.User) (string, error) {
	now := time.Now()
	claims := TokenClaims{
		Role: user.Role.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "filemanager",
			// this is jti - a unique identifier for the token
			// i have no idea why they called it ID but okay i guess
			ID:        uuid.New().String(),
			Subject:   user.UUID,
			// ExpiresAt: jwt.NewNumericDate(now.Add(time.Hour * 24)),
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Second * 30)),
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
