package routes

import (
	"codeberg.org/narukoshin/new-filemanager/internal/api"
	"codeberg.org/narukoshin/new-filemanager/internal/config"
	authservice "codeberg.org/narukoshin/new-filemanager/internal/services/auth"
	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v5"
	"github.com/labstack/echo/v5"
)

// Register adds the application's HTTP routes.
func Register(
	e *echo.Echo,
	users *api.Users,
	auth *api.Auth,
	jwtSecret []byte,
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

	protected := api.Group("")
	protected.Use(echojwt.WithConfig(echojwt.Config{
		SigningKey:    jwtSecret,
		SigningMethod: jwt.SigningMethodHS256.Alg(),
		NewClaimsFunc: func(ctx *echo.Context) jwt.Claims {
			return new(authservice.TokenClaims)
		},
	}))

	protected.GET("/auth/me", auth.GetMe)

	// User routes
	api.POST("/users", users.CreateUser)
	api.GET("/users", users.GetUsers)
	api.GET("/users/:userid", users.GetUserById)
	api.PUT("/users/:userid", users.UpdateUser)
	api.DELETE("/users/:userid", users.DeleteUser)
}
