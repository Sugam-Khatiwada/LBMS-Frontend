# Library Management System — Frontend

Short project overview

React-based frontend for a Library Borrowing Management System (LBMS).
Role-based UI for Librarians and Borrowers: view/manage books, borrow/return books, view borrower history, and dashboards.
Uses a REST API backend (configure API base URL via environment variable).

## Prerequisites

- Node.js (v16+ recommended)
- npm (or yarn)
- Windows PowerShell / Command Prompt (examples below use npm)

## Quick setup (Windows)

1. Clone repository and open the project folder.

2. Install dependencies:

```bash
npm install
```

3. Create an environment file at project root (optional):

`.env`

Add:

```
REACT_APP_API_URL=http://localhost:4000/api
```

4. Start development server:

```bash
npm start
```

5. Build for production:

```bash
npm run build
```

## Project structure (important folders)

src/

- `App.jsx` — Root router and app bootstrap
- `Layout/` — Shared UI: Header, Sidebar, BookTable, etc.
- `pages/` — Route pages for Librarians and Borrowers
- `utils/` — Helpers: ProtectedRoute, Logout, API wrappers
- `assets/` or `styles/` — Static assets and styles (if present)

## API & Data flow

Frontend expects REST endpoints for books, borrowers, borrow/return actions, and auth.

Example endpoints (adjust to backend):

- `GET /books`
- `POST /books`
- `PUT /books/:id`
- `DELETE /books/:id`
- `POST /auth/login`
- `POST /borrow/:bookId`
- `POST /return/:bookId`

