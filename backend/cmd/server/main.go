package main

/**;
;* Author: Naru K
;* therxwold.dev
;*
;* Credits:
;* backend implementation - Naru K
;* backend design direction and style - Naru K x Eluuna
;*
;* Saltatio Mortis - My Mother Told Me is a good song
;**/

import (
	"github.com/narukoshin/new-filemanager/internal/app"
	"github.com/narukoshin/new-filemanager/internal/logging"
)

func main() {
	defer func(){
		if err := recover(); err != nil {
			logging.Logger.Error().Interface("panic", err).Msg("panicked")
		}
	}()
	if err := app.Start(); err != nil {
		logging.Logger.Fatal().Err(err).Msg("failed to start application")
	}
}