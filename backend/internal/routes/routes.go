package routes

import (
	"codeberg.org/narukoshin/new-filemanager/internal/api"
	"codeberg.org/narukoshin/new-filemanager/internal/config"
	"github.com/labstack/echo/v5"
)

// Register adds the application's HTTP routes.
func Register(
	e *echo.Echo,
	users *api.Users,
	auth *api.Auth,
) {
	// Health check
	e.GET("/health", func(c *echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})

	// API routes group
	api := e.Group("/api/v1")
	api.GET("/version", func(c *echo.Context) error {
		return c.JSON(200, map[string]string{"version": config.GetVersion()})
	})

	// Auth routes
	api.POST("/auth/login", auth.Login)

	// User routes
	api.POST("/users", users.CreateUser)
	api.GET("/users", users.GetUsers)
	api.GET("/users/:userid", users.GetUserById)
	api.PUT("/users/:userid", users.UpdateUser)
	api.DELETE("/users/:userid", users.DeleteUser)
}
