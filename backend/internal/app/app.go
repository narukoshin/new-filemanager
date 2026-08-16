package app

import (
	"github.com/narukoshin/new-filemanager/internal/server"
)

func Start() error {
	s := server.New(":8080")
	return s.Start()
}
