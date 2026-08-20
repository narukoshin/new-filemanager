package auth

import (
	"codeberg.org/narukoshin/new-filemanager/internal/database"
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/models/auth"
	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
	"codeberg.org/narukoshin/new-filemanager/internal/requestctx"
	"codeberg.org/narukoshin/new-filemanager/internal/security/password"
	"context"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
)

type Service struct {
	db        *database.Database
	password  *password.Argon2id
	jwtSecret []byte
}

type TokenClaims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
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

	logging.Logger.Debug().Str("username", user.Username).Msg("login username")
	logging.Logger.Debug().Str("password", user.Password_hash).Msg("login password")

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

	token, err := s.GenerateToken(ctx, user)
	if err != nil {
		return "", err
	}

	logging.Logger.Debug().Str("token", token).Msg("login token")

	return token, nil
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
