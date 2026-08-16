package database

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	db *sql.DB
}

// Wake wakes up the database.
func Open() (*Database, error) {

	return &Database{}, nil
}

// Close closes the database connection.
func (db *Database) Close() error {
	// return db.db.Close()
	return nil
}
