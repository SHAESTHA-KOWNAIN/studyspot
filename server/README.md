# StudySpot server (planned)

The backend has not been implemented. This directory currently contains planning documentation only; there are no Express routes, database models, authentication handlers, or running API service here.

## Planned stack

- Node.js and Express.js for the HTTP API.
- MongoDB with Mongoose for users, study spaces, and availability reports.
- bcrypt for password hashing and JWT for authentication.
- Role-based authorization for moderator-only study-space management.

## Planned responsibilities

- Register and authenticate users without exposing credentials or password hashes.
- Return normalized study-space and report data for the client API adapter.
- Support search and directory filters described in [../docs/API.md](../docs/API.md).
- Accept authenticated community reports, retaining reporter identity and timestamp.
- Restrict create, update, and deactivate operations to moderators.
- Preserve report history when a study space is deactivated.
- Validate all inputs and enforce authorization server-side; frontend route guards are not security controls.

## Environment and implementation status

The root [`.env.example`](../.env.example) contains proposed local-development settings only. No real secrets belong in Git. Database schema, token policy, error format, validation rules, and deployment settings remain to be decided when backend work begins.

The frontend works independently in mock mode. No backend has been started or tested.
