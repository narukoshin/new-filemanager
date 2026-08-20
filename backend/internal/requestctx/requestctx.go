package requestctx

import (
	"context"
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
)

// stateKey is the context key used to store request response metadata.
type stateKey struct{}

// state stores response metadata associated with a request context.
type state struct {
	status  int
	message string

	body    any
	bodySet bool
}

// Request provides access to response metadata for a request.
type Request struct {
	state *state
}

// New returns a context initialized with request response metadata.
func New(ctx context.Context) context.Context {
	return context.WithValue(ctx, stateKey{}, &state{})
}

// With returns the response metadata associated with ctx.
func With(ctx context.Context) *Request {
	s, ok := ctx.Value(stateKey{}).(*state)
	if !ok {
		s = &state{}
	}

	return &Request{
		state: s,
	}
}

// Status sets the HTTP response status.
func (r *Request) Status(status int) *Request {
	r.state.status = status
	return r
}

// Message sets the response message.
func (r *Request) Message(message string) *Request {
	r.state.message = message
	return r
}

// Body sets a custom response body.
func (r *Request) Body(body any) *Request {
	r.state.body = body
	r.state.bodySet = true
	return r
}

// Fallback sets the status and message when they have not already been set.
func (r *Request) Fallback(status int, message string) *Request {
	if r.state.status == 0 {
		r.state.status = status
	}
	if r.state.message == "" {
		r.state.message = message
	}
	return r
}

// Response writes the configured JSON response to ctx.
func (r *Request) Response(ctx *echo.Context, data any) error {
	status := r.state.status
	if status == 0 {
		status = http.StatusOK
	}
	// Explicit custom body always wins.
	if r.state.bodySet {
		return ctx.JSON(status, r.state.body)
	}
	// Message response.
	if r.state.message != "" {
		return ctx.JSON(status, map[string]any{
			"message":   r.state.message,
			"data":      data,
			"timestamp": time.Now().Unix(),
		})
	}
	// Normal response.
	return ctx.JSON(status, data)
}

func (r *Request) ContextGet() (string, error) {
	token, ok := r.state.body.(string)
	if !ok {
		return "", nil
	}
	return token, nil
}
