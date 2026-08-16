package app

import (
	"github.com/narukoshin/new-filemanager/internal/server"
	"github.com/narukoshin/new-filemanager/internal/logging"
	"github.com/narukoshin/new-filemanager/internal/config"
)

// VERSION is the version of the application
const VERSION = "1.0.0"

// init sets the version of the application
func init() {
	config.SetVersion(VERSION)
}

func Start() error {
	s := server.New(":8080")
	logging.Logger.Info().Msg("this thing somehow works")
	return s.Start()
}
