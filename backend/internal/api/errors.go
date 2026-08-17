package api

import "github.com/labstack/echo/v5"

// errorResponse returns an error response with the given code and message.
func errorResponse(c *echo.Context, code int, message string) error {
	return c.JSON(code, map[string]string{"message": message})
}
