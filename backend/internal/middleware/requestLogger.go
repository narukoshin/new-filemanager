package middleware

import (
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/narukoshin/new-filemanager/internal/logging"
)

// RequestLogger is a middleware that logs the request
func RequestLogger() echo.MiddlewareFunc {
	return middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogStatus: true,
		LogURI:    true,
		LogMethod: true,
		LogValuesFunc: func(c *echo.Context, v middleware.RequestLoggerValues) error {
			logging.Logger.Info().
				Str("method", c.Request().Method).
				Str("uri", c.Request().URL.Path).
				Str("ip", c.RealIP()).
				Int("Status", v.Status).
				Str("user-agent", c.Request().UserAgent()).
				Msg("request")
			return nil
		},
	})
}