package database

import (
	"context"
	"fmt"

	"codeberg.org/narukoshin/new-filemanager/internal/models/auth"
	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
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
	return user, nil
}

func (db *Database) RevokeToken(ctx context.Context, revokedToken auth.RevokedToken) error {
	result, err := db.db.ExecContext(
		ctx,
		`INSERT INTO revoked_tokens (
			jti,
			expires_at
		) VALUES (
			$1,
			$2
		)`,
		revokedToken.Jti,
		revokedToken.RevokedAt,
	)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("failed to revoke token")
	}
	return nil
}

func (db *Database) IsTokenRevoked(ctx context.Context, jti string) (bool, error) {
	var revoked bool
	err := db.db.QueryRowContext(
		ctx,
		`SELECT EXISTS(
			SELECT 1 FROM revoked_tokens WHERE jti = $1
		)`,
		jti,
	).Scan(&revoked)
	if err != nil {
		return false, err
	}
	return revoked, nil
}
