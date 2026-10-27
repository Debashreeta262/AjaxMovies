# Meridian &mdash; Employee/Admin Portal

A small full-stack staff portal: registration, login, an employee dashboard,
and an admin dashboard, with role-based access control backed by MongoDB.

```
employee-portal/
  backend/     Node.js + Express + MongoDB (Mongoose) API, JWT auth
  frontend/    Plain HTML/CSS/JS — no framework, no build step
```

## How access control works

- Anyone who registers gets an **employee** account. There's no public way
  to create an admin account.
- Every employee can always see **their own** profile in full.
- Employees can only see the shared **staff directory** (colleagues' names,
  departments, designations) once an admin flips their `directoryAccess`
  flag on, from the admin dashboard. Until then the directory tab shows a
  locked state.
- **Admin accounts are never shown to employees**, through any route,
  regardless of the access flag.
- Admins see every account in full, and can grant/revoke directory access,
  suspend, or delete accounts.
- The role used for authorization always comes from the database record
  tied to the JWT — the frontend never gets to declare "I'm an admin."

## 1. Backend setup

**Requirements:** Node.js 18+, and a MongoDB instance (local install, or a
free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your connection string
- `JWT_SECRET` — any long random string
- `CLIENT_ORIGIN` — the origin your frontend is served from (see step 2)
- `SEED_ADMIN_*` — the first admin account's details

Create the first admin account (only needs to be run once):

```bash
npm run seed
```

Start the server:

```bash
npm start          # or: npm run dev  (auto-restarts on changes, needs nodemon)
```

You should see `Connected to MongoDB` and `Server running on http://localhost:5000`.

## 2. Frontend setup

The frontend is static files — no build step. The simplest way to serve it
so the browser treats it as a real origin (needed for `fetch` + CORS):

- **VS Code:** install the "Live Server" extension, right-click
  `frontend/index.html` &rarr; "Open with Live Server" (defaults to
  `http://127.0.0.1:5500`, which matches `CLIENT_ORIGIN` in `.env.example`).
- **Or, from a terminal:**
  ```bash
  cd frontend
  npx serve -l 5500
  ```

If your frontend ends up on a different port, update `CLIENT_ORIGIN` in the
backend `.env` to match, and restart the backend.

If your backend isn't on `localhost:5000`, update `API_BASE` at the top of
`frontend/js/api.js`.

## 3. Try it out

1. Open the frontend URL &rarr; **Home page**.
2. **Register** a new employee account &rarr; you land on the employee
   dashboard. The "Directory" tab is locked.
3. Open a private/incognito window, **log in** with the seeded admin
   account &rarr; you land on the admin dashboard and see every account,
   including the one you just registered.
4. Flip the toggle in the "Directory access" column for that employee.
5. Back in the employee's window, click the "Directory" tab again — it's
   now unlocked and lists colleagues (never the admin account).

## Notes on the security choices

- Passwords are hashed with bcrypt before they ever touch the database.
- Auth uses a signed JWT sent as `Authorization: Bearer <token>`; the
  server re-derives the user and role from that token on every request,
  it never trusts anything the client claims about itself.
- Login/registration are rate-limited to slow down brute-force attempts.
- `.env` is never committed — only `.env.example` is, as a template.
