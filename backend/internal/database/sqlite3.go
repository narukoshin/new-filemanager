package database

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"codeberg.org/narukoshin/new-filemanager/internal/config"
	_ "github.com/mattn/go-sqlite3"
)

// Database manages the application's database connection.
type Database struct {
	db *sql.DB
}

var (
	// errDatabaseNotConfigured indicates that no database file was configured.
	errDatabaseNotConfigured = errors.New("database not configured")
)

// Open opens the application database.
func Open() (*Database, error) {
	file := config.Conf.Database.SQLite3.File
	if file == "" {
		return nil, errDatabaseNotConfigured
	}
	// create folder if it doesn't exist
	dir := filepath.Dir(file)
	err := os.MkdirAll(dir, 0755)
	if err != nil {
		return nil, err
	}
	dsn := fmt.Sprintf("file:%s?_foreign_keys=on&_journal_mode=WAL&_busy_timeout=5000", file)
	// open database
	db, err := sql.Open("sqlite3", dsn)
	if err != nil {
		return nil, err
	}
	// ping the database
	err = db.Ping()
	if err != nil {
		db.Close()
		return nil, err
	}
	// migrate the database
	err = migrate(db)
	if err != nil {
		db.Close()
		return nil, err
	}
	return &Database{db: db}, nil
}

// Close closes the database connection.
func (db *Database) Close() error {
	if db.db == nil {
		return nil
	}
	return db.db.Close()
}
