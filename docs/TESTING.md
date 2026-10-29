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

## Backend integration tests (planned)

There is no backend or backend test suite yet. When server implementation begins, add isolated integration tests against a disposable test database and exercise at least:

- Registration validation, duplicate users, password hashing, and login.
- JWT authentication, expired/invalid tokens, and member/moderator authorization.
- Space create, get, update, filter combinations, and deactivation.
- Report creation validation, reporter identity, timestamp generation, and history ordering.
- Preservation of report history after deactivation.
- Stable success/error response formats expected by the client API adapter.

Tests must not depend on production credentials or a production database. Configuration, test framework, fixtures, and CI commands remain to be selected by the backend team.

## End-to-end testing (planned)

After the backend is implemented, add a browser-level smoke flow for member login/report submission and moderator space management. Until then, the frontend should be verified with mock mode, `npm test`, and `npm run build`.
