# StudySpot

StudySpot is a responsive campus study-space directory built for student-reported availability. Availability is community-reported, not live occupancy; reports can become outdated.

## Features

- Search and combine building, area, availability, facilities, quiet-zone, and group-study filters.
- Space details with facility information, freshness, report history, and member reports.
- Mock login, member registration, protected routes, and a moderator dashboard to create, edit, and deactivate spaces.
- Persistent mock spaces and report history, plus a moderator-only sample data reset control in mock mode.
- Separate API adapter for mock development and the planned Express API.

## Technology

React, Vite, JavaScript, React Router, Axios, Lucide React, CSS, Vitest, and React Testing Library.

## Run locally

Requires Node.js 20 or newer and npm.

```sh
npm install
Copy-Item .env.example .env
npm run dev
```

Open the local URL printed by Vite. The app runs without a backend in mock mode.

## Demo accounts

Mock authentication is for local development only and does not provide production security. Both seeded accounts use the documented demo password:

| Role | Email | Password |
|---|---|---|
| Member | `student@studyspot.demo` | `StudySpot123!` |
| Moderator | `moderator@studyspot.demo` | `StudySpot123!` |

New registrations receive the member role. The mock adapter never writes passwords to browser storage. Registered mock credentials exist only for the current page session; after logging out and reloading, use a seeded demo account or register again.

## Configuration and backend switch

Copy `.env.example` to `.env` and set:

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STALE_AFTER_HOURS=2
```

`VITE_USE_MOCK_API=true` uses local sample data and stores spaces, reports, and public mock profiles in localStorage. The signed-in mock user is persisted to keep the development session across refreshes. The moderator dashboard offers a confirmation-protected reset for mock spaces, reports, and registrations.

Set `VITE_USE_MOCK_API=false` and adjust `VITE_API_BASE_URL` when the backend is ready. The API adapter is prepared for:

- `POST /api/auth/register` and `POST /api/auth/login`
- `GET /api/spaces`, `POST /api/spaces`, `GET /api/spaces/:id`, `PATCH /api/spaces/:id`, and `DELETE /api/spaces/:id`
- `GET /api/spaces/:id/reports` and `POST /api/spaces/:id/reports`

Directory filters are sent as query parameters. The backend contract and integration have not been validated because no backend is included. Real authorization, password hashing, and token validation must be implemented server-side.

## Commands

```sh
npm run dev       # Start the development server
npm test          # Run frontend tests
npm run build     # Build the production bundle
npm run preview   # Preview the production bundle locally
```

## Limitations

- Availability reports are user-submitted mock data and do not represent sensor readings or live occupancy.
- Mock authentication and browser storage are not secure and must not be used for production.
- Backend response mapping may need small adjustments once the actual Express API response shapes are finalized.
- Registered mock-account credentials are intentionally not persisted.
