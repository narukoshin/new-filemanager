package users

import (
	"codeberg.org/narukoshin/new-filemanager/internal/database"
)

type Service struct {
	db *database.Database
}

func NewService(db *database.Database) *Service {
	return &Service{db: db}
}
