# StudySpot API (proposed)

This document describes the client API contract and implementation status. Authentication and study-space endpoints remain proposed; the availability report endpoints are implemented as described below.

## Conventions proposed

- Base URL: `http://localhost:5000/api`.
- JSON request and response bodies.
- Successful resources may be wrapped in `{ "data": ... }`; the client adapter currently accepts either this envelope or a direct resource response.
- Error response shape is not finalized. The frontend displays an available error message and otherwise uses a general message.
- Authenticated endpoints should use `Authorization: Bearer <token>`. Moderator permissions must be enforced by the server.
- IDs are represented as strings. The mock client uses stable strings; production database IDs may require normalization.
- Dates are ISO 8601 timestamps.

## Authentication

### `POST /api/auth/register`

Request:

```json
{
  "name": "Avery Morgan",
  "email": "avery@example.edu",
  "password": "example-password"
}
```

Proposed success response (`201`):

```json
{
  "data": {
    "user": {
      "id": "user-id",
      "name": "Avery Morgan",
      "email": "avery@example.edu",
      "role": "member"
    },
    "token": "issued-token"
  }
}
```

Public registration should not accept a moderator role. Password policy and validation-error details are not finalized.

### `POST /api/auth/login`

Request:

```json
{
  "email": "avery@example.edu",
  "password": "example-password"
}
```

Proposed success response (`200`) uses the same `{ "data": { "user": ..., "token": ... } }` shape as registration. Token format, refresh strategy, expiry, logout/revocation, and failure response remain to be finalized.

## Study spaces

Proposed space representation:

```json
{
  "id": "space-id",
  "name": "Central Library",
  "building": "Main Block",
  "area": "Level 2 · East Wing",
  "description": "A bright reading floor.",
  "facilities": ["Power outlets", "Wi-Fi"],
  "quietZone": true,
  "groupStudyAllowed": false,
  "active": true
}
```

### `GET /api/spaces`

Returns active spaces by default. Supported query parameters:

| Parameter | Proposed meaning |
|---|---|
| `search` | Match space name, building, area, or description |
| `building` | Filter by building |
| `area` | Filter by area |
| `quietZone` | `true` or `false` |
| `groupStudyAllowed` | `true` or `false` |
| `facility` | Include spaces that have this facility |
| `status` | Filter by latest report status |

Proposed response: `{ "data": { "spaces": [/* space objects */] } }`. Pagination, sort order, whether a report summary is embedded, and inactive-space visibility are not finalized.

### `GET /api/spaces/:id`

Returns one space, proposed as `{ "data": { "space": {/* space object */} } }`. Missing-space behavior and whether inactive spaces can be read by the public are not finalized.

### `POST /api/spaces`

Moderator only. Request contains the space fields above except `id`; active-state behavior for creation is to be confirmed. Proposed response is `201` with `{ "data": { "space": {/* created space */} } }`.

### `PATCH /api/spaces/:id`

Moderator only. Request contains fields to update. The client currently sends a full edited space; partial-update semantics should be confirmed. Proposed response is `200` with `{ "data": { "space": {/* updated space */} } }`.

### `DELETE /api/spaces/:id`

Moderator only. The client treats this action as deactivation, not permanent deletion, so report history remains preserved. Proposed response is `200` with `{ "data": { "space": {/* inactive space */} } }`. Whether the backend should use `DELETE` or an explicit deactivation endpoint remains open.

## Reports

Proposed report representation:

```json
{
  "id": "report-id",
  "spaceId": "space-id",
  "reporterId": "user-id",
  "reporterName": "Avery M.",
  "status": "Available",
  "note": "Several desks are free.",
  "reportedAt": "2026-10-29T10:00:00.000Z",
  "createdAt": "2026-10-29T10:00:00.000Z"
}
```

Supported status strings in the current frontend are `Available`, `Moderately Busy`, `Busy`, and `Temporarily Closed`. Freshness is derived from `createdAt` by the client and is not a fifth report status.

### `GET /api/spaces/:id/reports`

Returns report history ordered newest first as `{ "success": true, "data": { "reports": [...], "pagination": { "page": 1, "limit": 10, "totalReports": 1, "totalPages": 1 } } }`. Query parameters are `page` (default `1`) and `limit` (default `10`, maximum `100`). Reports include `reportedAt` and the frontend-compatible `createdAt`, `id`, and `reporterName` fields. `reporterId` is populated with only `_id` and `name`.

### `POST /api/spaces/:id/reports`

Authenticated member or moderator. Request:

```json
{
  "status": "Available",
  "note": "Several desks are free."
}
```

The note is optional and limited to 300 trimmed characters. Reporter identity and timestamp are derived on the server. The implemented success response is `201` with `{ "success": true, "data": { "report": {/* report object */} } }`. Each submission creates a separate report document.

### `GET /api/spaces/:id/reports/latest`

Returns the latest report and its computed freshness as `{ "success": true, "data": { "report": {/* report object */}, "status": "Available", "reportedAt": "2026-10-31T08:00:00.000Z", "freshness": "Fresh" } }`. Freshness is `Fresh`, `Stale`, or `No Report`; reports become stale at an age greater than or equal to `STALE_AFTER_HOURS` (default `2`). With no reports, `report`, `status`, and `reportedAt` are `null`, and `freshness` is `No Report`. The report's original status is not modified.

## Decisions needed before backend implementation

- Final response and validation-error envelope, HTTP status codes, and pagination.
- MongoDB ID normalization and exact space/report field constraints.
- JWT expiry, refresh/revocation, and how the frontend restores sessions.
- Whether inactive spaces and report history are public.
- Reporter display-name/privacy policy.
- Whether deactivation remains `DELETE` or uses a dedicated route.
- Rate limiting and abuse prevention for community reporting.
