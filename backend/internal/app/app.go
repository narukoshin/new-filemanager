package app

import (
	"codeberg.org/narukoshin/new-filemanager/internal/api"
	"codeberg.org/narukoshin/new-filemanager/internal/config"
	"codeberg.org/narukoshin/new-filemanager/internal/database"
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/routes"
	"codeberg.org/narukoshin/new-filemanager/internal/server"
	"codeberg.org/narukoshin/new-filemanager/internal/users"
)

// VERSION is the application version.
const VERSION = "1.0.0"

// init sets the version of the application
func init() {
	config.SetVersion(VERSION)
}

// Start loads the configuration, configures logging, and runs the HTTP server.
func Start() error {
	// initializing the configuration
	if err := config.Load(); err != nil {
		return err
	}
	// configuring the logger
	if err := logging.Configure(); err != nil {
		return err
	}
	// initializing the database
	db, err := database.Open()
	if err != nil {
		return err
	}
	defer db.Close()

	// initializing the services
	usersService := users.NewService(db)

	// initializing the APIs
	users := api.NewUsers(usersService)

	// initializing the HTTP server
	srv := server.New(":" + config.Conf.Server.Port)
	// registering the routes
	routes.Register(
		srv.Router(),
		users,
	)
	return srv.Start()
}
