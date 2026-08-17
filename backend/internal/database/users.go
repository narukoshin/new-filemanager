package database

import (
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
	"context"
)

func (db *Database) CreateUser(ctx context.Context, user *user.User) error {
	row := db.db.QueryRowContext(
		ctx,
		`INSERT INTO users (
			username,
			password_hash,
			role,
			disabled
		) VALUES (
			$1,
			$2,
			$3,
			$4
		) RETURNING id, created_at, updated_at`,
		user.Username,
		user.Password_hash,
		user.Role.String(),
		user.Disabled,
	)

	logging.Logger.Debug().
		Str("username", user.Username).
		Str("role", user.Role.String()).
		Bool("disabled", user.Disabled).
		Msg("Inserting the user into the database")

	return row.Scan(
		&user.ID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
}

// check if user exists by username
func (db *Database) UserExists(ctx context.Context, username string) (bool, error) {
	row := db.db.QueryRowContext(
		ctx,
		`SELECT id FROM users WHERE username = $1`,
		username,
	)
	var id int64
	err := row.Scan(&id)
	if err != nil {
		return false, err
	}
	if id == 0 {
		return false, nil
	}
	return true, nil
}