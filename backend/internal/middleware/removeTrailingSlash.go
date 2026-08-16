package middleware

import (
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

// RemoveTrailingSlash is a middleware that removes trailing slashes from the request path
func RemoveTrailingSlash() echo.MiddlewareFunc {
	return middleware.RemoveTrailingSlash()
}