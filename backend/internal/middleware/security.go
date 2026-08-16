package middleware

import (
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

// SecurityHeaders returns middleware that adds security headers to responses.
func SecurityHeaders() echo.MiddlewareFunc {
	return middleware.SecureWithConfig(middleware.SecureConfig{
		XSSProtection:         "0", // X-XSS-Protection is deprecated and should be disabled
		ContentTypeNosniff:    "nosniff",
		XFrameOptions:         "SAMEORIGIN",
		ReferrerPolicy:        "strict-origin-when-cross-origin",
		HSTSMaxAge:            31536000,
		ContentSecurityPolicy: "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
	})
}
