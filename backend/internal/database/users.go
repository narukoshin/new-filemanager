package database

import (
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/models/user"
	"context"
)

// CreateUser inserts user into the database and populates its generated fields.
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

// UserExists reports whether a user with username exists.
func (db *Database) UserExists(ctx context.Context, username string) (bool, error) {
	row := db.db.QueryRowContext(
		ctx,
		`SELECT id FROM users WHERE username = $1`,
		username,
	)
	var id int64
	row.Scan(&id)
	if id == 0 {
		return false, nil
	}
	return true, nil
}

// GetUsers returns all users in the database.
func (db *Database) GetUsers(ctx context.Context) ([]*user.User, error) {
	rows, err := db.db.QueryContext(
		ctx,
		`SELECT id, username, role, disabled, created_at, updated_at FROM users`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	users := make([]*user.User, 0)
	for rows.Next() {
		user := &user.User{}
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.Role,
			&user.Disabled,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return users, nil
}

// GetUserById returns a user by id.
func (db *Database) GetUserById(ctx context.Context, id string) (*user.User, error) {
	user := &user.User{}
	row := db.db.QueryRowContext(
		ctx,
		`SELECT id, username, role, disabled, created_at, updated_at FROM users WHERE id = $1`,
		id,
	)
	row.Scan(
		&user.ID,
		&user.Username,
		&user.Role,
		&user.Disabled,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	// if the user doesnt exist, returning empty struct
	// database is not supposed to validate and stuff
	if user.ID == 0 {
		return user, nil
	}
	// if there is an error, return it
	if err := row.Err(); err != nil {
		return nil, err
	}
	return user, nil
}

// DeleteUser deletes a user by id.
func (db *Database) DeleteUser(ctx context.Context, id string) (bool, error) {
	result, err := db.db.ExecContext(
		ctx,
		`DELETE FROM users WHERE id = $1`,
		id,
	)
	if err != nil {
		return false, err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	return rowsAffected > 0, nil
}

// UpdateUser
func (db *Database) UpdateUser(ctx context.Context, id string, user *user.User) (bool, error) {
	row := db.db.QueryRowContext(
		ctx,
		`UPDATE users SET 
			username = $1, 
			role = $2, 
			disabled = $3, 
			updated_at = current_timestamp
		WHERE id = $4 
		RETURNING id, created_at, updated_at`,
		user.Username,
		user.Role.String(),
		user.Disabled,
		id,
	)
	err := row.Scan(
		&user.ID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return false, err
	}
	return true, nil
}