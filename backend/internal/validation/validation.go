package validation

import (
	"codeberg.org/narukoshin/new-filemanager/internal/logging"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v5"
)

type Validator struct {
	validator *validator.Validate
}

func New() *Validator {
	return &Validator{
		validator: validator.New(),
	}
}

func (v *Validator) Validate(i any) error {
	logging.Logger.Debug().
		Msg("Validating request body")
	if err := v.validator.Struct(i); err != nil {
		return echo.ErrBadRequest.Wrap(err)
	}
	return nil
}
