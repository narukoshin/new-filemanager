package password

import (
	"errors"
	"strings"
	"testing"
)

func newTestArgon2id() *Argon2id {
	return &Argon2id{
		memory:      64 * 1024,
		iterations:  3,
		parallelism: 4,
		saltLength:  16,
		keyLength:   32,
	}
}

func TestArgon2idHashAndVerify(t *testing.T) {
	hasher := newTestArgon2id()

	encodedHash, err := hasher.Hash("correct horse battery staple")
	if err != nil {
		t.Fatalf("Hash() error = %v", err)
	}

	if !strings.HasPrefix(encodedHash, "$argon2id$") {
		t.Fatalf("Hash() = %q, want argon2id prefix", encodedHash)
	}

	valid, err := hasher.Verify("correct horse battery staple", encodedHash)
	if err != nil {
		t.Fatalf("Verify() error = %v", err)
	}
	if !valid {
		t.Fatal("Verify() = false for the correct password")
	}
}

func TestArgon2idVerifyRejectsWrongPassword(t *testing.T) {
	hasher := newTestArgon2id()

	encodedHash, err := hasher.Hash("correct password")
	if err != nil {
		t.Fatalf("Hash() error = %v", err)
	}

	valid, err := hasher.Verify("wrong password", encodedHash)
	if err != nil {
		t.Fatalf("Verify() error = %v", err)
	}
	if valid {
		t.Fatal("Verify() = true for the wrong password")
	}
}

func TestArgon2idHashUsesUniqueSalt(t *testing.T) {
	hasher := newTestArgon2id()

	first, err := hasher.Hash("same password")
	if err != nil {
		t.Fatalf("first Hash() error = %v", err)
	}

	second, err := hasher.Hash("same password")
	if err != nil {
		t.Fatalf("second Hash() error = %v", err)
	}

	if first == second {
		t.Fatal("Hash() returned identical hashes for independently salted passwords")
	}
}

func TestArgon2idVerifyRejectsInvalidHash(t *testing.T) {
	hasher := newTestArgon2id()

	tests := []struct {
		name string
		hash string
	}{
		{name: "empty", hash: ""},
		{name: "wrong algorithm", hash: "$bcrypt$salt$hash"},
		{name: "invalid base64", hash: "$argon2id$!$!"},
		{name: "wrong salt length", hash: "$argon2id$c2FsdA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			valid, err := hasher.Verify("password", test.hash)
			if valid {
				t.Fatal("Verify() = true for an invalid hash")
			}
			if !errors.Is(err, ErrInvalidHash) {
				t.Fatalf("Verify() error = %v, want ErrInvalidHash", err)
			}
		})
	}
}
