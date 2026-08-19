package auth

import (
	"codeberg.org/narukoshin/new-filemanager/internal/database"
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/models/auth"
	"codeberg.org/narukoshin/new-filemanager/internal/requestctx"
	"codeberg.org/narukoshin/new-filemanager/internal/security/password"
	"context"
	"net/http"
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
	// searching the user by username
	user, err := s.db.GetUserByUsername(ctx, req.Username)
	if err != nil {
		return err
	}

	logging.Logger.Debug().Str("username", user.Username).Msg("login username")
	logging.Logger.Debug().Str("password", user.Password_hash).Msg("login password")

	// checking if the password matches
	ok, err := s.password.Verify(req.Password, user.Password_hash)
	if err != nil {
		logging.Logger.Debug().Msg(err.Error())
		return err
	}
	if !ok {
		logging.Logger.Debug().Msg("wrong password")
		requestctx.With(ctx).
			Status(http.StatusUnauthorized).
			Message(ErrWrongPassword.Error())
		return ErrWrongPassword
	}
	return nil
}
