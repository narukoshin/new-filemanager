package users

import (
	"regexp"
)

var usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]+$`)

func validateUsername(username string) error {
	if len(username) < 3 {
		return ErrUsernameTooShort
	}
	if len(username) > 30 {
		return ErrUsernameTooLong
	}
	if !usernameRegex.MatchString(username) {
		return ErrUsernameInvalid
	}
	return nil
}