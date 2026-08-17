package users

import (
	"codeberg.org/narukoshin/new-filemanager/internal/database"
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/models/role"
	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
	"context"
	"strings"
)

type Service struct {
	db *database.Database
}

func NewService(db *database.Database) *Service {
	return &Service{db: db}
}

func (s *Service) CreateUser(ctx context.Context, req *user.CreateUserRequest) (*user.User, error) {
	logging.Logger.Debug().Msg("Validating the request to create a new user")
	// validate the request fields
	req.Username = strings.TrimSpace(req.Username)
	if req.Username == "" {
		return nil, errUsernameRequired
	}
	if req.Password == "" {
		return nil, errPasswordRequired
	}
	if req.Role != "" && !role.IsValid(req.Role.String()) {
		return nil, errInvalidRole
	}
	// setting default role
	if req.Role == "" {
		req.Role = role.DefaultRole
	}
	// check if the user already exists
	exists, err := s.db.UserExists(ctx, req.Username)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errUsernameExists
	}

	// create the user
	createdUser := &user.User{
		Profile: user.Profile{
			Username: req.Username,
			Role:     role.Role(req.Role),
		},
		Password_hash: req.Password,
		Disabled:      false,
	}
	if err := s.db.CreateUser(ctx, createdUser); err != nil {
		return nil, err
	}
	return createdUser, nil
}
