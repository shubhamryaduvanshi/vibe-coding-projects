# Auth & Authorization

## Purpose
- Secure API endpoints with JWT.
- Provide role-based access control.

## Requirements
- Issue JWT on login.
- Verify token on protected routes.
- Enforce admin-only access where required.

## Notes
- Use middleware for token validation.
- Seed initial admin user on startup.
