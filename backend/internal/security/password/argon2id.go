package password

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"strings"

	"golang.org/x/crypto/argon2"
)

type Argon2id struct {
	memory      uint32
	iterations  uint32
	parallelism uint8
	saltLength  uint32
	keyLength   uint32
}

var ErrInvalidHash = errors.New("invalid hash")

func NewArgon2id() *Argon2id {
	return &Argon2id{
		memory:      64 * 1024,
		iterations:  3,
		parallelism: 4,
		saltLength:  16,
		keyLength:   32,
	}
}

func (a *Argon2id) Hash(password string) (string, error) {
	salt := make([]byte, a.saltLength)

	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	hash := argon2.IDKey(
		[]byte(password),
		salt,
		a.iterations,
		a.memory,
		a.parallelism,
		a.keyLength,
	)

	return "$argon2id$" +
		base64.RawStdEncoding.EncodeToString(salt) + "$" +
		base64.RawStdEncoding.EncodeToString(hash), nil
}

func (a *Argon2id) Verify(password, encodedHash string) (bool, error) {
	parts := strings.Split(encodedHash, "$")

	// "$argon2id$salt$hash"
	if len(parts) != 4 ||
		parts[0] != "" ||
		parts[1] != "argon2id" {
		return false, ErrInvalidHash
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[2])
	if err != nil || len(salt) != int(a.saltLength) {
		return false, ErrInvalidHash
	}

	expectedHash, err := base64.RawStdEncoding.DecodeString(parts[3])
	if err != nil || len(expectedHash) != int(a.keyLength) {
		return false, ErrInvalidHash
	}

	actualHash := argon2.IDKey(
		[]byte(password),
		salt,
		a.iterations,
		a.memory,
		a.parallelism,
		a.keyLength,
	)

	return subtle.ConstantTimeCompare(
		actualHash,
		expectedHash,
	) == 1, nil
}
