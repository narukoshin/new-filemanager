#!/usr/bin/env python3
import secrets
import base64

# Generate a cryptographically secure 512-bit JWT secret (64 bytes)
secret = base64.urlsafe_b64encode(secrets.token_bytes(64)).rstrip(b"=").decode("ascii")

print(secret)
