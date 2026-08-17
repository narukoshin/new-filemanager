package users

import (
	"codeberg.org/narukoshin/new-filemanager/internal/database"
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/models/role"
	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
	"codeberg.org/narukoshin/new-filemanager/internal/requestctx"
	"context"
	"net/http"
	"strings"
)

// Service implements user-related business operations.
type Service struct {
	db *database.Database
}

// NewService creates a user service backed by db.
func NewService(db *database.Database) *Service {
	return &Service{db: db}
}

// CreateUser validates req and creates a user.
func (s *Service) CreateUser(ctx context.Context, req *user.CreateUserRequest) (*user.User, error) {
	logging.Logger.Debug().Msg("Validating the request to create a new user")
	// validate the request fields
	req.Username = strings.TrimSpace(req.Username)
	if req.Username == "" {
		requestctx.With(ctx).
			Status(http.StatusBadRequest).
			Message("username is required")
		return nil, ErrUsernameRequired
	}
	if req.Password == "" {
		return nil, ErrPasswordRequired
	}
	if req.Role != "" && !role.IsValid(req.Role.String()) {
		return nil, ErrInvalidRole
	}
	// setting default role
	if req.Role == "" {
		req.Role = role.DefaultRole
	}

	// validate the username
	if err := validateUsername(req.Username); err != nil {
		requestctx.With(ctx).
			Status(http.StatusBadRequest).
			Message(err.Error())
		return nil, err
	}

	// check if the user already exists
	exists, err := s.db.UserExists(ctx, req.Username)
	if err != nil {
		requestctx.With(ctx).
			Status(http.StatusInternalServerError).
			Message(err.Error())
		return nil, err
	}
	if exists {
		requestctx.With(ctx).
			Status(http.StatusConflict).
			Message("username already exists")
		return nil, ErrUsernameExists
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

// GetUsers returns all users or ErrNoUsers when none exist.
func (s *Service) GetUsers(ctx context.Context) ([]*user.User, error) {
	users, err := s.db.GetUsers(ctx)
	if err != nil {
		return nil, err
	}
	// return an empty list when no users exist
	if len(users) == 0 {
		requestctx.With(ctx).
			Status(http.StatusNotFound).
			Body([]*user.User{})
		return []*user.User{}, nil
	}
	return users, nil
}
