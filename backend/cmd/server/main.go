package main

import (
	"github.com/narukoshin/new-filemanager/internal/app"
	"github.com/narukoshin/new-filemanager/internal/logging"
)

func main() {
	defer func(){
		if err := recover(); err != nil {
			logging.Logger.Fatal().Err(err.(error)).Msg("panicked")
		}
	}()
	if err := app.Start(); err != nil {
		logging.Logger.Fatal().Err(err).Msg("failed to start application")
	}
}