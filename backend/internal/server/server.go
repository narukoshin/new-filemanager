package server

import (
	"github.com/labstack/echo/v5"
	"github.com/narukoshin/new-filemanager/internal/middleware"
	"github.com/narukoshin/new-filemanager/internal/routes"
)

type Server struct {
	router  *echo.Echo
	address string
}

func New(address string) *Server {
	return &Server{
		router:  echo.New(),
		address: address,
	}
}

func (s *Server) Start() error {
	// removing trailing slashes from the request path
	s.router.Pre(middleware.RemoveTrailingSlash())
	// registering the routes and then starting the server
	routes.Register(s.router)
	// middleware for security headers
	s.router.Use(middleware.SecurityHeaders())
	// middleware for request logging
	s.router.Use(middleware.RequestLogger())
	return s.router.Start(s.address)
}
