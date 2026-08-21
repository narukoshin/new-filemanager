package auth

import (
	"time"
)

type AuthLoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type RevokedToken struct {
	Jti string
	RevokedAt time.Time
}