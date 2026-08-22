package routes

import (
	"net/http"

	"codeberg.org/narukoshin/new-filemanager/internal/api"
	"codeberg.org/narukoshin/new-filemanager/internal/config"
	jwts "codeberg.org/narukoshin/new-filemanager/internal/security/jwt"
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
			return new(jwts.TokenClaims)
		},
		SuccessHandler: auth.IsTokenRevoked,
		ErrorHandler: func(ctx *echo.Context, err error) error {
			return ctx.JSON(http.StatusUnauthorized, map[string]string{"message": "unauthorized"})
		},
	}))

	protected.GET("/auth/me", auth.GetMe)
	protected.POST("/auth/logout", auth.Logout)

	// User routes
	protected.POST("/users", users.CreateUser)
	protected.GET("/users", users.GetUsers)
	protected.GET("/users/:userid", users.GetUserById)
	protected.PUT("/users/:userid", users.UpdateUser)
	protected.DELETE("/users/:userid", users.DeleteUser)
}
