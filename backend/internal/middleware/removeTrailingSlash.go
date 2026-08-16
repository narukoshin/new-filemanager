package middleware

import (
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

// RemoveTrailingSlash returns middleware that removes trailing slashes from request paths.
func RemoveTrailingSlash() echo.MiddlewareFunc {
	return middleware.RemoveTrailingSlash()
}
