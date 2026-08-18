package users

import (
	"errors"
	"regexp"
	"strconv"
)

// usernameRegex is the regular expression used to validate usernames.
var usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]+$`)

// validateUsername validates the username.
func validateUsername(username string) error {
	if len(username) < 4 {
		return ErrUsernameTooShort
	}
	if len(username) > 32 {
		return ErrUsernameTooLong
	}
	if !usernameRegex.MatchString(username) {
		return ErrUsernameInvalid
	}
	return nil
}

func validateUserID(id string) error {
	// checking if the id is a valid integer
	_, err := strconv.Atoi(id)
	if err != nil {
		return errors.New("id is not a valid integer")
	}
	return nil
}
