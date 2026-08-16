package app

import (
	"codeberg.org/narukoshin/new-filemanager/internal/config"
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"codeberg.org/narukoshin/new-filemanager/internal/server"
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
	s := server.New(":" + config.Conf.Server.Port)
	return s.Start()
}
