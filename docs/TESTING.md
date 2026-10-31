# StudySpot testing

## Frontend tests (implemented)

The frontend suite uses Vitest, jsdom, and React Testing Library. It runs in mock mode without a backend.

From `client/`:

```sh
npm test
```

Coverage currently includes:

- Fresh/stale report calculation and latest-report selection.
- Combined directory search and filter behavior.
- Mock report creation and history persistence.
- Mock space creation and deactivation while retaining reports.
- Login, registration, and report form validation.
- Protected and moderator route access.
- Moderator dashboard scrolling and create/edit form selection.

Build verification:

```sh
npm run build
```

## Backend report tests (implemented)

The report API suite runs from the repository root with:

```sh
npm --prefix server test
```

The tests use `mongodb-memory-server` and Supertest; they do not connect to a development or production database. They cover report creation and validation, authentication integration behavior, report history and pagination, safe reporter population, latest-report selection, and freshness boundaries/configuration.

Authentication integration is tested with a test-only middleware. Production report submission remains fail-closed until the authentication module is wired in. Registration/login, JWT expiry, study-space CRUD, and end-to-end integration tests remain for the corresponding team members.

## End-to-end testing (planned)

After the backend is implemented, add a browser-level smoke flow for member login/report submission and moderator space management. Until then, the frontend should be verified with mock mode, `npm test`, and `npm run build`.
