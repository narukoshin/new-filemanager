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

// GetUserById returns a user by id.
func (s *Service) GetUserById(ctx context.Context, id string) (*user.User, error) {
	user := &user.User{}
	// validating user input
	if id == "" {
		requestctx.With(ctx).
			Status(http.StatusBadRequest).
			Message("id is required")
		return nil, ErrUserNotFound
	}
	// trimming the id to remove any leading or trailing whitespace
	id = strings.TrimSpace(id)
	// validating the id
	if err := validateUserID(id); err != nil {
		requestctx.With(ctx).
			Status(http.StatusBadRequest).
			Message(err.Error())
		return nil, err
	}
	// getting the user by id
	user, err := s.db.GetUserById(ctx, id)
	if err != nil {
		return nil, err
	}
	// if the user doesnt exist, responding with 404 and error message
	if user.ID == 0 {
		requestctx.With(ctx).
			Status(http.StatusNotFound).
			Message("user not found")
		return nil, ErrUserNotFound
	}
	return user, nil
}

// DeleteUser deletes a user by id.
func (s *Service) DeleteUser(ctx context.Context, id string) error {
	logging.Logger.Debug().Msg("Deleting user")
	// validating user input
	if id == "" {
		requestctx.With(ctx).
			Status(http.StatusBadRequest).
			Message("id is required")
		return ErrUserNotFound
	}
	// trimming the id to remove any leading or trailing whitespace
	id = strings.TrimSpace(id)
	// validating the id
	if err := validateUserID(id); err != nil {
		requestctx.With(ctx).
			Status(http.StatusBadRequest).
			Message(err.Error())
		return err
	}
	// deleting the user
	err := s.db.DeleteUser(ctx, id)
	if err != nil {
		return err
	}
	return nil
}
