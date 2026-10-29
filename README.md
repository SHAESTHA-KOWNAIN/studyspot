# StudySpot — Study Space Availability Board

StudySpot helps students find libraries, quiet study zones, reading rooms, and group-study spaces using community-reported availability updates. Students can browse facilities, report current conditions, and review report history. Moderators can manage study-space listings.

**Availability is community-reported.** StudySpot does not provide live occupancy tracking, seat reservations, or sensor-based availability, and reports may become outdated.

## Project status

The React frontend is implemented and works independently with mock data. The Node.js/Express/MongoDB backend has not been implemented. Its planned scope is documented in [server/README.md](./server/README.md), and the proposed API contract is in [docs/API.md](./docs/API.md).

## Repository structure

```text
studyspot/
├── client/                 # React + Vite frontend and tests
│   ├── public/
│   ├── src/
│   │   ├── api/            # API adapters
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/           # Development sample data
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/       # Mock services
│   │   ├── styles/
│   │   ├── test/
│   │   └── utils/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Planned backend; documentation only so far
├── docs/                   # Proposed API contract and testing notes
├── screenshots/
├── .env.example            # Proposed server configuration
├── .gitignore
└── README.md
```

## Features

### Student experience

- Browse spaces and search by name, building, area, or description.
- Combine filters for building, area, availability, facilities, quiet-zone suitability, and group-study suitability.
- View space descriptions, facilities, latest community reports, report timestamps, freshness, and report history.
- Submit an availability report with an optional note when signed in.

### Moderator tools

- View summary counts for active spaces, reports, and stale reports.
- Search and filter listings.
- Create, edit, and deactivate spaces. Deactivation hides a space from the public directory while preserving its report history.
- Reset sample data in mock development mode.

### Application behavior

- Responsive pages, form validation, and loading, error, and empty states.
- Protected frontend routes and mock role-aware authentication.
- Persistent mock spaces and reports, isolated behind an API adapter.

Frontend route protection is for user experience only. Real authentication and authorization must be enforced by the backend.

## Technology

| Technology | Purpose |
|---|---|
| React, JavaScript, Vite | Frontend and build tooling |
| React Router DOM | Client-side routing |
| Axios | Planned HTTP API integration |
| Lucide React | Icons |
| CSS3 | Responsive styling |
| Vitest, React Testing Library | Frontend tests |
| localStorage | Development mock-data persistence |

**Planned backend:** Node.js, Express.js, MongoDB, Mongoose, and server-side authentication. No backend implementation or completed API integration is included yet.

## Run the client

Prerequisites: Node.js 20 or newer and npm.

From the repository root, install and start the frontend:

```powershell
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. The client runs in mock mode and does not require a backend.

Client commands (run from `client/`):

```sh
npm test          # Run frontend tests
npm run build     # Build the production bundle
npm run preview   # Preview the production build
```

See [docs/TESTING.md](./docs/TESTING.md) for implemented frontend coverage and planned backend integration tests.

## Demo accounts

Both seeded development accounts use password `StudySpot123!`.

| Role | Email |
|---|---|
| Member | `student@studyspot.demo` |
| Moderator | `moderator@studyspot.demo` |

Mock authentication is for local development only and is not production security. New registrations receive the member role; users cannot assign themselves moderator access. Credentials for newly registered mock accounts are not persisted.

## Application routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Registration |
| `/spaces` | Study-space directory |
| `/spaces/:id` | Space details and report history |
| `/moderator` | Moderator dashboard |
| `*` | Not-found page |

## Availability and freshness

The four report statuses are **Available**, **Moderately Busy**, **Busy**, and **Temporarily Closed**. The latest report timestamp determines the displayed status. Freshness is separate from availability and does not change the report status:

- **Fresh:** latest report is within the configured freshness threshold.
- **Stale:** latest report is older than the threshold.
- **No reports yet:** no report exists for the space.

The default threshold is two hours.

## Environment configuration

The frontend reads `client/.env`; begin with `client/.env.example`:

```dotenv
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STALE_AFTER_HOURS=2
```

| Variable | Description |
|---|---|
| `VITE_USE_MOCK_API` | Use mock services unless set to `false` |
| `VITE_API_BASE_URL` | Base URL for the planned Express API |
| `VITE_STALE_AFTER_HOURS` | Hours before a report is marked stale |

Restart Vite after changing environment variables. Variables prefixed with `VITE_` are exposed to browser code; never put secrets in them.

The root `.env.example` lists proposed server settings only. It does not indicate that a backend is present. Keep real `.env` files local and out of Git.

Mock data changes persist in browser localStorage. The moderator dashboard offers a confirmation-protected reset of sample spaces, reports, and mock registrations.

## Planned API

The client adapter is prepared for the endpoint families below. Exact request/response shapes, validation errors, authorization policy, and some endpoint semantics remain to be confirmed; the backend and integration are not yet implemented or tested.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register a member |
| `POST` | `/api/auth/login` | Authenticate a user |
| `GET` | `/api/spaces` | List and filter spaces |
| `POST` | `/api/spaces` | Create a space (moderator) |
| `GET` | `/api/spaces/:id` | Get a space |
| `PATCH` | `/api/spaces/:id` | Update a space (moderator) |
| `DELETE` | `/api/spaces/:id` | Deactivate a space (moderator; semantics to confirm) |
| `GET` | `/api/spaces/:id/reports` | Get report history |
| `POST` | `/api/spaces/:id/reports` | Submit a report |

Directory filters are planned for `search`, `building`, `area`, `quietZone`, `groupStudyAllowed`, `facility`, and `status`. See [docs/API.md](./docs/API.md) for proposed fields, payloads, and open contract decisions.

## Security and limitations

- Mock authentication and browser storage are not secure and must not be used in production.
- Backend password hashing, token validation, input validation, and role authorization remain to be implemented server-side.
- Availability is community-reported, not live occupancy.
- The real Express API has not been implemented or tested against the frontend; response mapping may need updates when the contract is finalized.
- Registered mock-account credentials are intentionally not persisted.

## Collaboration

Check the working tree before changing files with `git status`. Use feature branches and pull requests when appropriate, and avoid committing over another team member's unfinished work. Do not commit real environment files, credentials, or secrets.

StudySpot is a collaborative academic project. Add contributor names and responsibilities here when agreed by the group.
