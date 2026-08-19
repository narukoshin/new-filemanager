package users

import (
	"github.com/google/uuid"
)

func (s *Service) generateUUID() (string, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return "", err
	}
	return id.String(), nil
}
