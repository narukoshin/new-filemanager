// Package logging configures the application's structured logger.
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
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"codeberg.org/narukoshin/new-filemanager/internal/config"
)

// Logger is the application's shared structured logger.
var Logger = zerolog.New(
	zerolog.ConsoleWriter{
		Out:        os.Stderr,
		TimeFormat: time.RFC3339,
	},
).With().Timestamp().Logger()

// Configure configures Logger using the loaded application settings.
func Configure() error {
	if config.Conf != nil && config.Conf.Logging.File != "" {
		file, err := os.OpenFile(config.Conf.Logging.File, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
		if err != nil {
			return err
		}
		consoleWriter := zerolog.ConsoleWriter{Out: os.Stdout}
		multi := zerolog.MultiLevelWriter(consoleWriter, file)
		Logger = log.Output(multi)
	} else {
		Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339})
	}
	// set log level
	zerolog.SetGlobalLevel(GetLevel())
	return nil
}

// GetLevel returns the configured log level.
func GetLevel() zerolog.Level {
	switch config.Conf.Logging.Level {
	case "debug":
		return zerolog.DebugLevel
	case "info":
		return zerolog.InfoLevel
	case "warn":
		return zerolog.WarnLevel
	case "error":
		return zerolog.ErrorLevel
	case "fatal":
		return zerolog.FatalLevel
	case "panic":
		return zerolog.PanicLevel
	default:
		return zerolog.InfoLevel
	}
}
