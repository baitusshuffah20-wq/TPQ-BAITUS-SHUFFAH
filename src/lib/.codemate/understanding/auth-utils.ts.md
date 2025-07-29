# High-Level Documentation

## Overview

This module provides simple authentication utilities for a Next.js server environment. It exposes types and functions to:

- Retrieve the currently authenticated user from a request (using cookies or headers).
- Validate the structure of an authenticated user.
- Check if the authenticated user has the "ADMIN" role.

## Exposed Types and Functions

### `AuthUser` Interface

Describes the shape of an authenticated user object, containing:

- `id`: User identifier (string).
- `name`: User name (string).
- `email`: User email address (string).
- `role`: User role, which can be one of: `"ADMIN" | "MUSYRIF" | "WALI" | "SANTRI"`.

---

### `getAuthUser(request: NextRequest): Promise<AuthUser | null>`

- Fetches the authenticated user's information from a Next.js `NextRequest`.
- Looks for an auth token in the cookies (as `"auth_token"`) or in the `Authorization` header (removing `"Bearer "` prefix).
- Validates that the token is present and starts with `"mock_token_"` (stub validation for demo purposes).
- If valid, retrieves user info from a cookie `"auth_user"` (expected to be URL-encoded JSON), parses it, and returns it as an `AuthUser`.
- Returns `null` if no valid token or user data is present, or upon parse errors.

---

### `isAdmin(user: AuthUser | null): boolean`

- Returns `true` if the given user has the role `"ADMIN"`, otherwise returns `false`.

---

## Usage Notes

- **Token Validation:** The code is designed for demonstration; in a real-world application, token validation and user extraction should be more secure, likely involving JWT or database lookups.
- **Error Handling:** All errors during parsing and authentication gracefully return `null` (no user).
- **Role Checks:** The `isAdmin` function allows for simple role-based authorization logic.

---

## Intended Context

These helpers are intended for use in Next.js middleware or API routes where authentication and role-based access control are needed.
