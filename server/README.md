# StudySpot server (in progress)

The backend is in progress. Availability report submission, history, latest-report retrieval, and freshness calculations are implemented. The authentication and study-space modules are still owned by other team members and are not implemented here.

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

## Report module integration

The report routes are mounted under `/api/spaces`. History and latest-status reads are public. Report submission requires an authentication middleware passed to `createReportRoutes({ authenticate })`; that middleware must set `req.user` with `_id`, `name`, and `role` (`member` or `moderator`). Until the authentication owner wires in that middleware, submissions fail closed with `503`; no placeholder or bypass authentication is used.

The report module references Mongoose models named `StudySpace` and `User`. The study-space model must expose an `active` field (spaces without `active: false` are treated as active), and the user model must expose `name`. Reporter population explicitly selects only `name`.

`STALE_AFTER_HOURS` controls freshness and defaults to `2`. Freshness is calculated when requested and is never stored in a report.

## Environment and implementation status

The root [`.env.example`](../.env.example) contains proposed local-development settings only. No real secrets belong in Git. Database schema, token policy, error format, validation rules, and deployment settings remain to be decided when backend work begins.

The frontend works independently in mock mode. Report API tests use an isolated in-memory MongoDB; they do not connect to the configured development database.
