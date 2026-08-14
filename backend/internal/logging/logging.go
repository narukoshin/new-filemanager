package logging

/**;
;* fun fact; this is first time im using zerolog package
;* i didnt even read the docs yet on how to use it but well figure it out in da process
;* ...like always
;*
;* from what ive seen i like it more than log/slog :))
;*/

import (
	"os"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

var Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout})