package routes

import (
	"github.com/labstack/echo/v5"
	// "github.com/labstack/echo/v5/middleware"
)

func Register(e *echo.Echo) {
	e.GET("/", func(c *echo.Context) error {
		return c.JSON(200, map[string]string{"message": "Hello, World!"})
	})
}
