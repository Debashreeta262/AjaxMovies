# Rolodex &mdash; Contact Manager

A full CRUD contact manager: add, view, edit, and delete contacts, with
search, category filtering, sorting, and a favorite/star toggle.

```
contact-manager/
  backend/     Node.js + Express + MongoDB (Mongoose) REST API
  frontend/    Plain HTML/CSS/JS — no framework, no build step
```

## 1. Backend setup

**Requirements:** Node.js 18+, and a MongoDB instance (local install, or a
free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

```
cd backend
npm install
```

Copy the env file. **On Windows Command Prompt**, `cp` doesn't exist — use `copy`:

```
copy .env.example .env
```

(On Mac/Linux or Git Bash, `cp .env.example .env` works fine.)

Open `.env` and set:
- `MONGO_URI` — your connection string, e.g.
  `mongodb://127.0.0.1:27017/contact_manager` for a local install, or your
  Atlas connection string
- `CLIENT_ORIGIN` — the origin your frontend is served from (see step 2)

Start the server:

```
npm start
```

You should see `Connected to MongoDB` and `Server running on http://localhost:5000`.
If you see a MongoDB connection error, double check `MONGO_URI` in `.env`
and that MongoDB is actually running (local service started, or your IP is
allowed in Atlas's Network Access settings).

## 2. Frontend setup

No build step — just serve the static files so the browser treats them as
a real origin (needed for `fetch` + CORS to work):

- **VS Code:** install the "Live Server" extension, right-click
  `frontend/index.html` &rarr; "Open with Live Server" (defaults to
  `http://127.0.0.1:5500`, which matches `CLIENT_ORIGIN` in `.env.example`).
- **Or from a terminal:**
  ```
  cd frontend
  npx serve -l 5500
  ```

If your frontend ends up on a different port, update `CLIENT_ORIGIN` in
`backend/.env` to match, and restart the backend.

If your backend isn't on `localhost:5000`, update `API_BASE` at the top of
`frontend/js/api.js`.

## 3. Using it

- **Add** &mdash; click "+ Add contact", fill in the form. A contact needs a
  name plus at least an email or a phone number.
- **View** &mdash; contacts show as cards with their details; search the
  top bar or filter by category to narrow the list.
- **Edit** &mdash; click "Edit" on any card, change fields, save.
- **Delete** &mdash; click "Delete" on a card; you'll get a confirmation
  prompt first.
- **Favorite** &mdash; click the star on a card to mark/unmark it (handy
  once you're filtering/sorting a longer list).

## API reference (if you want to test it directly, e.g. with Postman)

| Method | Route                       | Description                     |
|--------|------------------------------|----------------------------------|
| GET    | `/api/contacts`              | List contacts (supports `?search=`, `?category=`, `?sort=`) |
| GET    | `/api/contacts/:id`          | Get one contact                 |
| POST   | `/api/contacts`              | Create a contact                |
| PUT    | `/api/contacts/:id`          | Update a contact                |
| PATCH  | `/api/contacts/:id/favorite` | Toggle favorite                 |
| DELETE | `/api/contacts/:id`          | Delete a contact                |
