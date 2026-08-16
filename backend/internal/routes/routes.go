package routes

import (
	"github.com/labstack/echo/v5"
	"github.com/narukoshin/new-filemanager/internal/config"
)

func Register(e *echo.Echo) {
	// Health check
	e.GET("/health", func(c *echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})

	// API routes group
	api := e.Group("/api/v1")
	api.GET("/version", func(c *echo.Context) error {
		return c.JSON(200, map[string]string{"version": config.GetVersion()})
	})
}
