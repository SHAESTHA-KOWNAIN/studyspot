# StudySpot — Study Space Availability Board

StudySpot is a responsive campus web application that helps students find libraries, quiet study zones, reading rooms, and group-study spaces using community-reported availability updates.

Students can browse study spaces, check facilities, submit status reports, and view when information was last updated. Moderators can manage official study-space listings.

**Important:** StudySpot displays community-reported information. It does not provide live occupancy tracking, seat reservations, or sensor-based availability.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Demo Accounts](#demo-accounts)
- [Application Pages](#application-pages)
- [Availability and Freshness Rules](#availability-and-freshness-rules)
- [Environment Configuration](#environment-configuration)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Security Notes](#security-notes)
- [Limitations](#limitations)
- [Future Backend Integration](#future-backend-integration)
- [Contributors](#contributors)

## Features

### Student features

- Register an account and log in.
- Browse study spaces across campus buildings and areas.
- Search by space name, building, area, or description.
- Filter spaces by building, area, availability, facilities, quiet-zone suitability, and group-study suitability.
- View descriptions, facilities, and study-space information.
- View the latest community-reported status and timestamp.
- Submit an availability report with an optional note.
- View recent report history.
- Identify reports that are fresh or stale.

### Moderator features

- Access a protected moderator dashboard.
- View summary statistics for study spaces and reports.
- Create new study-space listings.
- Edit existing space information.
- Deactivate study spaces that should no longer appear in the public directory.
- Search and filter listings in the management dashboard.
- Reset sample data in development mode.

### Interface features

- Responsive layout for desktop, tablet, and mobile.
- Reusable React components.
- Form validation and user feedback.
- Loading, error, and empty states.
- Mock data persistence for development.
- A separate API adapter to support future backend integration.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development server and build tool |
| JavaScript | Application logic |
| React Router DOM | Client-side routing |
| Axios | HTTP requests for backend integration |
| Lucide React | Icons |
| CSS3 | Responsive styling |
| Vitest | Frontend testing |
| React Testing Library | Component and interaction testing |
| localStorage | Development mock-data persistence |

**Planned backend:** Node.js, Express.js, MongoDB, Mongoose, and server-side authentication.

The backend is developed separately and is not included in the current frontend-only implementation.

## Project Structure

The main frontend files are organized as follows:

```text
studyspot/
├── public/
├── src/
│   ├── api/
│   │   ├── authApi.js
│   │   ├── axios.js
│   │   ├── reportsApi.js
│   │   └── spacesApi.js
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── test/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

The directories under `src/` separate API communication, reusable components, authentication state, mock data, pages, services, styles, tests, and utilities.

The exact contents may change as the project develops.

## Getting Started

### Prerequisites

Install the following:

- Node.js 20 or newer
- npm
- Git
- A code editor such as Visual Studio Code

### 1. Clone the repository

```bash
git clone https://github.com/SHAESTHA-KOWNAN/studyspot.git
cd studyspot
```

Replace the repository URL if the GitHub owner or repository name differs from the actual project URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file from the example.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**

```bash
cp .env.example .env
```

If `.env.example` does not exist yet, create it using the configuration shown in the Environment Configuration section.

### 4. Start the development server

```bash
npm run dev
```

Vite prints a local URL in the terminal. Open that URL in your browser, usually:

`http://localhost:5173`

The frontend runs in mock mode and does not require a backend server.

## Demo Accounts

The application includes seeded development accounts for testing.

| Role | Email | Password |
|---|---|---|
| Member | `student@studyspot.demo` | `StudySpot123!` |
| Moderator | `moderator@studyspot.demo` | `StudySpot123!` |

Use these accounts to explore the member and moderator workflows.

New registrations receive the member role. Users cannot assign themselves the moderator role through the registration form.

**Security notice:** These are development-only mock accounts. Mock authentication does not provide production security.

Registered mock-account credentials are not persisted across page reloads. Use a seeded demo account or register again after a reload if a newly registered account is no longer available.

## Application Pages

| Route | Description |
|---|---|
| `/` | Landing page and application introduction |
| `/login` | Login page |
| `/register` | Registration page |
| `/spaces` | Study-space directory and filters |
| `/spaces/:id` | Study-space details and report history |
| `/moderator` | Moderator dashboard |
| `*` | Not-found page |

Protected pages require the appropriate mock authentication state and role.

Frontend route protection is for the user interface only. Real authorization must also be enforced by the backend.

## Availability and Freshness Rules

StudySpot supports four community-reported availability statuses:

| Status | Meaning |
|---|---|
| Available | A recent report indicates the space is available |
| Moderately Busy | A report indicates moderate activity |
| Busy | A report indicates that the space is busy |
| Temporarily Closed | A report indicates temporary closure |

### Freshness

The default freshness threshold is two hours.

- **Fresh:** The latest report is within the configured freshness window.
- **Stale:** The latest report is older than the configured freshness window.
- **No reports yet:** No report has been submitted for the space.

Freshness is separate from availability. An old report may still display its original status alongside a stale indicator.

The latest report timestamp determines the displayed availability. A stale report is not automatically changed to a different status.

## Environment Configuration

The `.env.example` file should contain:

```dotenv
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STALE_AFTER_HOURS=2
```

| Variable | Description |
|---|---|
| `VITE_USE_MOCK_API` | Enables mock services when set to `true` |
| `VITE_API_BASE_URL` | Base URL for the planned Express API |
| `VITE_STALE_AFTER_HOURS` | Number of hours before a report is marked stale |

After changing environment variables, restart the Vite development server.

Variables prefixed with `VITE_` are exposed to frontend code. Do not put passwords, database credentials, private API keys, or other secrets in these variables.

## API Overview

The frontend has a separate API adapter to keep page components independent of the data source.

The planned backend endpoints are:

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a member |
| POST | `/api/auth/login` | Authenticate a user |

### Study spaces

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/spaces` | Retrieve and filter study spaces |
| POST | `/api/spaces` | Create a study-space listing |
| GET | `/api/spaces/:id` | Retrieve one study space |
| PATCH | `/api/spaces/:id` | Update a study-space listing |
| DELETE | `/api/spaces/:id` | Deactivate or remove a listing according to the backend contract |

### Reports

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/spaces/:id/reports` | Submit an availability report |
| GET | `/api/spaces/:id/reports` | Retrieve report history |

### Directory filters

The directory is designed to support query parameters such as:

- `search`
- `building`
- `area`
- `status`
- `facility`
- `quietZone`
- `groupStudyAllowed`

Exact parameter names and response formats must be confirmed with the backend team before integration.

**Current status:** The frontend has a mock implementation and an API adapter prepared for the planned Express API. The real backend contract and end-to-end integration have not yet been verified.

## Testing

Run the frontend test suite:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The frontend has been reported to pass its existing 12 tests and production build verification. Rerun the commands above after making changes to confirm the current state.

### Recommended manual test cases

1. Open the landing page and navigate to the directory.
2. Search for a space by name and building.
3. Combine multiple directory filters.
4. Open a space and inspect its facilities and report history.
5. Log in as a member and submit each supported report status.
6. Verify that a new report updates the displayed status and timestamp.
7. Verify stale-report behavior.
8. Log out and check access restrictions.
9. Log in as a moderator and create a space.
10. Edit an existing listing and verify the form updates correctly.
11. Deactivate a space and confirm that it disappears from the public directory.
12. Refresh the browser and verify mock-data persistence.
13. Test forms with missing or invalid input.
14. Verify the layout at mobile and desktop screen sizes.

## Git Workflow

The project is maintained in Git and hosted on GitHub.

Check the current working tree:

```bash
git status
```

Stage and commit changes:

```bash
git add .
git commit -m "Describe your changes"
```

Push the current branch:

```bash
git push
```

For collaborative work, use feature branches and pull requests when appropriate. Pull the latest changes before starting new work, and avoid committing directly over another team member's unfinished changes.

## Security Notes

- Mock authentication is intended only for local development.
- Frontend route guards do not replace backend authorization.
- Password hashing must be implemented by the backend using a suitable password-hashing library.
- The backend must validate authentication tokens and enforce moderator permissions.
- Inputs must be validated on both the frontend and backend.
- Real database credentials and secrets must remain outside Git.
- The `.env` file should be excluded by `.gitignore`.
- The `.env.example` file must contain example configuration values only.

## Limitations

- Availability data in mock mode is sample or user-submitted development data, not live occupancy information.
- Mock authentication and browser storage are not suitable for production use.
- The real Express API has not yet been tested against the frontend.
- API response mapping may require adjustments when the backend contract is finalized.
- Production authentication, server-side authorization, and MongoDB persistence depend on the backend implementation.

## Future Backend Integration

When the backend becomes available:

1. Confirm the request and response formats with the backend team.
2. Start the Express server and MongoDB database.
3. Set `VITE_USE_MOCK_API=false`.
4. Set `VITE_API_BASE_URL` to the backend API URL.
5. Integrate login and registration with the real authentication endpoints.
6. Connect study-space listing, filtering, and detail pages to MongoDB-backed APIs.
7. Connect report submission and report history.
8. Connect moderator create, update, and deactivate operations.
9. Implement and verify server-side role authorization.
10. Test all workflows against the real backend and document any remaining issues.

The frontend design should remain independent of the backend implementation wherever possible.

## Contributors

StudySpot is a collaborative academic project developed using React, Node.js, Express.js, and MongoDB.

Add the names and responsibilities of all five group members here before final submission.

---

**Project:** StudySpot — Study Space Availability Board

**Purpose:** Help students make better study-space choices using community-reported information.

**Data freshness:** Configurable, two hours by default.

**Current mode:** Frontend with mock data; real backend integration pending.
