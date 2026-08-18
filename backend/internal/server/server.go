package server

import (
	"codeberg.org/narukoshin/new-filemanager/internal/middleware"
	"codeberg.org/narukoshin/new-filemanager/internal/validation"

	"github.com/labstack/echo/v5"
)

// Server owns the Echo instance and HTTP listen address.
type Server struct {
	router  *echo.Echo
	address string
}

// New creates the HTTP server.
func New(address string) *Server {
	router := echo.New()
	router.Validator = validation.New()

	// Runs before routing.
	router.Pre(
		middleware.RemoveTrailingSlash(),
	)

	// Runs for routed requests.
	router.Use(
		middleware.SecurityHeaders(),
		middleware.RequestLogger(),
	)

	return &Server{
		router:  router,
		address: address,
	}
}

// Router returns the Echo instance so routes can be registered during app setup.
func (s *Server) Router() *echo.Echo {
	return s.router
}

// Start begins serving HTTP requests.
func (s *Server) Start() error {
	return s.router.Start(s.address)
}
