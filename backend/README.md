# CampusCare backend

Spring Boot 3 REST API for the CampusCare React application. This project targets Java 17 and uses Maven, MySQL, Spring Data JPA, Bean Validation, and Spring Security. Backend files are isolated in this folder; the existing React frontend is unchanged.

## What the API provides

- Session login/logout and a current-user endpoint.
- Student registration that always creates a `STUDENT` account; clients cannot choose their role.
- Public request categories, student-owned request submission and tracking, and paginated filtering.
- Admin-only campus request management, status updates, assignment, soft deletion, and summary counts.
- Owner-or-admin authorization for individual request details and status history.
- CSRF protection for state-changing requests.

All endpoints are under `/api/v1`. There is no password reset or general user-management API in this phase.

## Requirements and database safety

- Java 17 or newer (`java -version`).
- MySQL with the existing `campuscare` database and four tables.
- Windows PowerShell. Maven is downloaded automatically by the included Maven Wrapper.

The application uses `spring.jpa.hibernate.ddl-auto=validate`. Hibernate checks that entity mappings match the existing tables; it does not create, update, or delete tables. Category seeding only inserts a category if its name is missing; existing categories are not removed or overwritten.

## Configure and run (Windows PowerShell)

Open PowerShell in this `backend` folder. Set environment variables for the current terminal session; replace the example values with your MySQL account details. Never commit real passwords.

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/campuscare?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME = "campuscare_app"
$env:DB_PASSWORD = "your-mysql-password"
```

To create the first admin user when its email does not already exist, optionally set these before startup. The password must have at least 12 characters. It is stored as a BCrypt hash. The application will not promote an existing student account.

```powershell
$env:BOOTSTRAP_ADMIN_EMAIL = "admin@campus.example"
$env:BOOTSTRAP_ADMIN_NAME = "CampusCare Admin"
$env:BOOTSTRAP_ADMIN_PASSWORD = "use-a-unique-12-character-password"
```

Run the API:

```powershell
.\mvnw.cmd spring-boot:run
```

The API listens on `http://localhost:8080`. If schema validation fails, stop and compare the existing MySQL columns with the entity mappings; do not change `ddl-auto` to `create`, `create-drop`, or `update` to work around it.

## Run the integrated frontend

The React app defaults to `VITE_API_BASE_URL=/api/v1`; the Vite development server proxies `/api` to `http://localhost:8080`. No API URL change is required for the local setup. To use a different backend, create a root `.env.local` based on `../.env.example`, set `VITE_API_BASE_URL` to the backend base URL ending in `/api/v1`, and restart Vite. For a different origin, configure the backend CORS allow-list and keep credentials enabled.

Run the backend in one terminal using the steps above. In a second terminal at the project root:

```powershell
npm install
npm run dev
```

The UI first checks the existing session. Sign in with an existing user or create a student account. To reach the admin workspace, sign in with an admin account provisioned in the database; public registration cannot create admin users. The browser keeps only the server session cookie, not request records or a client-selected role.

## Authentication and CSRF in Postman

Authentication uses an HTTP session cookie. Keep Postman's cookie jar enabled for `localhost:8080`; it must retain the `JSESSIONID` cookie between calls. CSRF protection also applies to POST, PATCH, and DELETE.

1. Send `GET http://localhost:8080/api/v1/auth/csrf`. Save the returned `headerName` and `token`, and retain any cookies returned by the server.
2. For registration or login, send the header whose name is `headerName` with its corresponding `token`. Keep the cookies.
3. After login, call the CSRF endpoint again and use the fresh token for subsequent state-changing requests.
4. Send authenticated requests with the same Postman cookie jar. A student can register, but an admin account must be provisioned by the protected bootstrap environment settings above or by an administrator managing the database.
5. To log out, send `POST /api/v1/auth/logout` with the session cookie and current CSRF header/token.

The CSRF endpoint returns a token in JSON for use by API clients. Do not disable CSRF as a shortcut when connecting a browser client.

## Endpoint reference

| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/v1/auth/csrf` | Public |
| `POST` | `/api/v1/auth/register` | Public; always creates a student |
| `POST` | `/api/v1/auth/login` | Public |
| `POST` | `/api/v1/auth/logout` | Authenticated |
| `GET` | `/api/v1/auth/me` | Authenticated |
| `GET` | `/api/v1/request-categories` | Public |
| `POST` | `/api/v1/requests` | Student |
| `GET` | `/api/v1/requests/mine` | Student |
| `GET` | `/api/v1/requests/recent?limit=5` | Authenticated; own requests for students, all requests for admins |
| `GET` | `/api/v1/requests/{publicId}` | Owner or admin |
| `GET` | `/api/v1/requests/{publicId}/history` | Owner or admin |
| `GET` | `/api/v1/dashboard/student/summary` | Student |
| `GET` | `/api/v1/dashboard/admin/summary` | Admin |
| `GET` | `/api/v1/admin/requests` | Admin |
| `PATCH` | `/api/v1/admin/requests/{publicId}/status` | Admin |
| `PATCH` | `/api/v1/admin/requests/{publicId}/assignment` | Admin |
| `DELETE` | `/api/v1/admin/requests/{publicId}` | Admin; soft-deletes the request |

`/requests/mine` and `/admin/requests` accept `query`, `status`, `categoryId`, `page` (zero-based), and `size` (1–100). Status values are `PENDING`, `IN_PROGRESS`, and `RESOLVED`; priorities are `LOW`, `MEDIUM`, and `HIGH`.

## Postman request/response examples

For examples below, first log in and retain the returned `JSESSIONID`. Send the current CSRF token in the header named by `/auth/csrf`. `categoryId` should be taken from `GET /api/v1/request-categories`; IDs are generated by the database.

### Register a student

`POST /api/v1/auth/register`

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.edu",
  "password": "replace-with-a-strong-password"
}
```

Response: `201 Created`

```json
{
  "id": 12,
  "name": "Alex Morgan",
  "email": "alex@example.edu",
  "role": "STUDENT"
}
```

### Get a CSRF token

`GET /api/v1/auth/csrf`

```json
{
  "headerName": "X-CSRF-TOKEN",
  "token": "copy-the-current-token-from-the-response"
}
```

Use the actual `headerName` returned by the running server and retain Postman cookies.

### Log in

`POST /api/v1/auth/login`

```json
{
  "email": "alex@example.edu",
  "password": "replace-with-a-strong-password"
}
```

Response: `200 OK`, user profile JSON as shown for registration. The authenticated session is in the response cookie.

### Submit a request

`POST /api/v1/requests`

```json
{
  "title": "Projector not working",
  "categoryId": 1,
  "location": "Classroom Block A, Room 204",
  "description": "The projector turns on but does not display an image during lectures.",
  "priority": "HIGH"
}
```

Response: `201 Created`

```json
{
  "id": "CC-91A4D7C20F18",
  "title": "Projector not working",
  "categoryId": 2,
  "category": "Electrical",
  "location": "Classroom Block A, Room 204",
  "description": "The projector turns on but does not display an image during lectures.",
  "priority": "HIGH",
  "status": "PENDING",
  "submittedAt": "2026-11-10T12:30:00Z",
  "updatedAt": "2026-11-10T12:30:00Z",
  "resolvedAt": null,
  "studentId": 12,
  "submittedBy": "Alex Morgan",
  "assignedAdminId": null,
  "assignedAdmin": null
}
```

The example's category ID is illustrative; category IDs depend on the existing database. Look up the Electrical category's actual ID before submitting: `GET /api/v1/request-categories`.

### List a student's requests

`GET /api/v1/requests/mine?status=PENDING&page=0&size=20`

Response:

```json
{
  "items": [],
  "page": 0,
  "size": 20,
  "totalItems": 0,
  "totalPages": 0
}
```

### Update status (admin only)

`PATCH /api/v1/admin/requests/CC-91A4D7C20F18/status`

```json
{
  "status": "IN_PROGRESS",
  "note": "Facilities team assigned"
}
```

Response: updated request JSON. Each actual status change adds a history entry.

### Assign a request (admin only)

`PATCH /api/v1/admin/requests/CC-91A4D7C20F18/assignment`

```json
{
  "adminUserId": 3
}
```

Response: updated request JSON including `assignedAdminId` and `assignedAdmin`.

### Validation error

Invalid request bodies return `400 Bad Request` with field-specific errors:

```json
{
  "timestamp": "2026-11-10T12:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Request validation failed.",
  "validationErrors": {
    "title": "must not be blank",
    "description": "size must be between 15 and 1000"
  }
}
```

Unauthenticated requests return `401`; authenticated users without the required role return `403`.

## Verify without touching MySQL

Integration tests use the isolated in-memory H2 profile configured under `src/test/resources`; they cover login, role checks, validation, request ownership, request lifecycle, summaries, and categories:

```powershell
.\mvnw.cmd verify
```

The test database is separate from MySQL. The production app remains configured to validate—not modify—the existing MySQL schema.
