package auth

import (
	"codeberg.org/narukoshin/new-filemanager/internal/database"
	"codeberg.org/narukoshin/new-filemanager/internal/models/auth"
	"codeberg.org/narukoshin/new-filemanager/internal/security/password"
	"context"
)

type Service struct {
	db       *database.Database
	password *password.Argon2id
}

func NewService(
	db *database.Database,
	password *password.Argon2id,
) *Service {
	return &Service{
		db:       db,
		password: password,
	}
}

func (s *Service) Login(ctx context.Context, req auth.AuthLoginRequest) error {
	return nil
}
