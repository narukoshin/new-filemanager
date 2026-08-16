package app

import (
	"github.com/narukoshin/new-filemanager/internal/config"
	"github.com/narukoshin/new-filemanager/internal/logging"
	"github.com/narukoshin/new-filemanager/internal/server"
)

// VERSION is the version of the application
const VERSION = "1.0.0"

// init sets the version of the application
func init() {
	config.SetVersion(VERSION)
}

func Start() error {
	// initializing the configuration
	if err := config.Load(); err != nil {
		return err
	}
	// configuring the logger
	if err := logging.Configure(); err != nil {
		return err
	}
	s := server.New(":8080")
	return s.Start()
}
