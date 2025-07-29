## High-Level Documentation: NextAuth Credentials Authentication with User Roles

### Overview

This code configures user authentication for a Next.js application using [NextAuth.js](https://next-auth.js.org/) with a credentials-based provider for email and password login. It supports custom user roles and enriches both JWT tokens and session objects with additional user information.

---

### Key Features

1. **Authentication Provider**
   - Uses the **Credentials Provider** to handle email/password authentication (no third-party OAuth).
   - Mock user data is provided for demonstration and testing, with three sample users: ADMIN, MUSYRIF, and WALI, each with pre-defined roles.

2. **Password Validation**
   - For demonstration, passwords are validated by directly comparing to the string `'password'` or using bcrypt password hash comparison.

3. **User Roles**
   - Supports three roles: `"ADMIN"`, `"MUSYRIF"`, `"WALI"`.
   - Role information is preserved and made available on both JWT and session objects.

4. **Session Strategy**
   - Uses `"jwt"` session strategy, storing session information as a JWT token.

5. **Custom Callbacks**
   - **JWT Callback:** Transfers role and avatar info to the JWT token when a user logs in.
   - **Session Callback:** Augments the session object with user ID, role, and avatar from the token for frontend use.

6. **Custom Pages**
   - Overrides sign-in and error pages to redirect users to `/login`.

7. **TypeScript Extensions**
   - Extends NextAuth module interfaces to include `id`, `role`, and optional `avatar` fields on User and Session objects.
   - Extends JWT type to carry `role` and optional `avatar`.

---

### Configuration Details

- **Provider:** Only "credentials" is enabled. User credentials are matched against a hardcoded mock list.
- **User Data:** Contains `id`, `email`, `password (hashed)`, `name`, `role`, and `avatar`.
- **Password:** All sample users’ passwords are the same bcrypt hash (`"password"`).
- **Adapters:** Prisma adapter is commented out, indicating future use with a database.
- **Secret:** Uses `NEXTAUTH_SECRET` from environment variables for token signing.

---

### Typical Usage

- **Login:** Users authenticate using email and password on `/login`.
- **Session:** On successful login, a session contains the user’s id, email, name, role, and optional avatar, enabling authorization and personalization.
- **Authorization:** User role accessible in both server and client contexts for access control logic.

---

### Extension Points

- Replace the mock user array with dynamic data from a database (e.g., using Prisma and the commented-out adapter).
- Add or modify user roles as needed.
- Implement additional authentication providers if needed.
- Adjust session or JWT callbacks to enrich or constrain available session data.

---

**Note:** This setup is intended for development/demo only as logins use hardcoded data and should not be used in production without connecting to a real user database.
