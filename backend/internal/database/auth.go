package database

import (
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
	"context"
	"fmt"
)

func (db *Database) GetUserByUsername(ctx context.Context, username string) (*user.User, error) {
	user := &user.User{}
	row := db.db.QueryRowContext(
		ctx,
		`SELECT 
			id, uuid, username, password_hash, role, disabled, created_at, updated_at 
		FROM users 
		WHERE username = $1`,
		username,
	)

	if err := row.Scan(
		&user.ID,
		&user.UUID,
		&user.Username,
		&user.Password_hash,
		&user.Role,
		&user.Disabled,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		return nil, err
	}

	logging.Logger.Debug().Str("dump", fmt.Sprintf("%+v", user)).Msg("Dumping user")

	return user, nil
}

func (db *Database) GetUserByUUID(ctx context.Context, uuid string) (*user.User, error) {
	user := &user.User{}
	row := db.db.QueryRowContext(
		ctx,
		`SELECT 
			id, uuid, username, password_hash, role, disabled, created_at, updated_at 
		FROM users 
		WHERE uuid = $1`,
		uuid,
	)

	if err := row.Scan(
		&user.ID,
		&user.UUID,
		&user.Username,
		&user.Password_hash,
		&user.Role,
		&user.Disabled,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		return nil, err
	}

	logging.Logger.Debug().Str("dump", fmt.Sprintf("%+v", user)).Msg("Dumping user")

	return user, nil
}
