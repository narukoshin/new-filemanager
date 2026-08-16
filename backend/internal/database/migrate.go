package database

import (
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"context"
	"database/sql"
	"embed"
	"io/fs"

	"github.com/pressly/goose/v3"
)

// migrationFS contains the SQL migration files embedded in the application.
//
//go:embed migrations/*.sql
var migrationFS embed.FS

// migrate applies all pending database migrations to db.
func migrate(db *sql.DB) error {
	migrations, err := fs.Sub(migrationFS, "migrations")
	if err != nil {
		return err
	}
	provider, err := goose.NewProvider(
		goose.DialectSQLite3,
		db,
		migrations,
	)
	if err != nil {
		return err
	}

	var r []*goose.MigrationResult

	if r, err = provider.Up(context.Background()); err != nil {
		return err
	}
	if len(r) > 0 {
		logging.Logger.Info().Msgf("Migrated %d migrations", len(r))
	}
	return nil
}
