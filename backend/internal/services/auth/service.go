package auth

import (
	"codeberg.org/narukoshin/new-filemanager/internal/database"
	"codeberg.org/narukoshin/new-filemanager/internal/models/auth"
	"context"
)

type Service struct {
	db *database.Database
}

func NewService(db *database.Database) *Service {
	return &Service{db: db}
}

func (s *Service) Login(ctx context.Context, req auth.AuthLoginRequest) error {
	return nil
}
