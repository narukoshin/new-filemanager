package auth

import (
	"context"
	"net/http"

	"codeberg.org/narukoshin/new-filemanager/internal/database"
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/models/auth"
	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
	"codeberg.org/narukoshin/new-filemanager/internal/requestctx"
	"codeberg.org/narukoshin/new-filemanager/internal/security/jwt"
	"codeberg.org/narukoshin/new-filemanager/internal/security/password"
)

type Service struct {
	db        *database.Database
	password  *password.Argon2id
	jwtSecret []byte
}

func NewService(
	db *database.Database,
	password *password.Argon2id,
	jwtSecret []byte,
) *Service {
	return &Service{
		db:        db,
		password:  password,
		jwtSecret: jwtSecret,
	}
}

func (s *Service) Login(ctx context.Context, req auth.AuthLoginRequest) (string, error) {
	// searching the user by username
	user, err := s.db.GetUserByUsername(ctx, req.Username)
	if err != nil {
		requestctx.With(ctx).
			Status(http.StatusUnauthorized).
			Message(ErrInvalidCredentials.Error())
		return "", err
	}

	// checking if the password matches
	ok, err := s.password.Verify(req.Password, user.Password_hash)
	if err != nil {
		logging.Logger.Debug().Msg(err.Error())
		return "", err
	}
	if !ok {
		logging.Logger.Debug().Msg("invalid credentials")
		requestctx.With(ctx).
			Status(http.StatusUnauthorized).
			Message(ErrInvalidCredentials.Error())
		return "", ErrInvalidCredentials
	}

	// check if the user is disabled
	if user.Disabled {
		requestctx.With(ctx).
			Status(http.StatusUnauthorized).
			Message(ErrInvalidCredentials.Error())
		return "", ErrInvalidCredentials
	}

	token, err := jwt.New(s.jwtSecret, ctx, user).GenerateToken()
	if err != nil {
		return "", err
	}
	return token, nil
}

func (s *Service) Logout(ctx context.Context, revokedToken auth.RevokedToken) error {
	logging.Logger.Debug().Msg("logging out")

	if revokedToken.Jti == "" {
		requestctx.With(ctx).
			Status(http.StatusBadRequest).
			Message("jti is required")
		return ErrInvalidToken
	}

	// revoking the token
	if err := s.db.RevokeToken(ctx, revokedToken); err != nil {
		requestctx.With(ctx).
			Status(http.StatusBadRequest).
			Message(ErrInvalidCredentials.Error())
		return err
	}

	return nil
}

func (s *Service) GetUserByUUID(ctx context.Context, uuid string) (*user.User, error) {
	user, err := s.db.GetUserByUUID(ctx, uuid)
	if err != nil {
		requestctx.With(ctx).
			Status(http.StatusUnauthorized).
			Message(ErrInvalidCredentials.Error())
		return nil, err
	}
	return user, nil
}

func (s *Service) IsTokenRevoked(ctx context.Context, jti string) error {
	revoked, err := s.db.IsTokenRevoked(ctx, jti)
	if err != nil {
		return err
	}
	if revoked {
		requestctx.With(ctx).
			Status(http.StatusUnauthorized).
			Message(ErrInvalidCredentials.Error())
		return ErrInvalidCredentials
	}
	return nil
}
