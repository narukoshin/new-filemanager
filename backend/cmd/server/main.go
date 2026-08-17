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
	"codeberg.org/narukoshin/new-filemanager/internal/app"
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
)

// main starts the file manager server.
func main() {
	if err := app.Start(); err != nil {
		logging.Logger.Fatal().Err(err).Msg("failed to start application")
	}
}
