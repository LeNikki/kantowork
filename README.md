# kantowork

A JSON API and a React frontend, both running in Docker alongside PostgreSQL.

| Service | What | Port |
|---|---|---|
| `kantowork-frontend` | Vite + React + TypeScript | 5173 |
| `kantowork-backend` | Express 4, JSON only — no views | 3000 |
| `kantowork-db` | PostgreSQL 18 | 5433 on your machine, 5432 inside Docker |

Auth is JWT: the API issues a signed token on login, and the frontend sends it
back as `Authorization: Bearer <token>`.

## Prerequisites

- **Docker Desktop**, running
- **Node.js** — only for the frontend's local `node_modules`, which your editor
  needs for TypeScript. The apps themselves run inside containers.

## First-time setup

**1. Create `.env` in the repo root.** Compose reads it for every service:

```bash
cp .env.example .env
```

Fill in your own values:

```
POSTGRES_DB=kantowork
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
JWT_SECRET=a_long_random_string_generate_your_own
```

Generate a real secret — it signs every auth token:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**2. Build and start all three containers.** The first run pulls images and
compiles `bcrypt`, so give it a few minutes:

```bash
docker compose up -d --build
```

**3. Create the database schema.** The database starts empty — migrations are
run explicitly, not by Postgres:

```bash
docker compose exec backend npm run migrate:up
```

**4. Install frontend dependencies locally** so your editor can resolve imports:

```bash
cd frontend && npm install
```

**5. Enable the pre-commit hook** (runs ESLint on staged frontend files):

```bash
git config core.hooksPath .githooks
```

This is a per-clone setting — it does not travel with the repository.

**6. Check it worked:**

```bash
curl http://localhost:3000/api/health
```

Expect `{"status":"ok","db":"connected","time":...}`. Then open
<http://localhost:5173> — you should be redirected to the login page.

## Everyday commands

```bash
docker compose up -d              # start everything
docker compose ps                 # status
docker compose logs -f backend    # follow logs
docker compose down               # stop, keep data
docker compose down -v            # stop and destroy the database
```

Both apps run with hot reload and are bind-mounted, so **saving a file is
enough** — no rebuild. Rebuild only after changing a `package.json`:

```bash
docker compose up -d --build backend
docker compose rm -sfv backend && docker compose up -d backend
```

The second line is needed because Compose reuses the old `node_modules` volume
otherwise, and you get `Cannot find module`.

## API

Everything lives under `/api`. Only `GET` routes open in a browser.

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/health` | database connectivity check |
| POST | `/api/auth/signup` | `{name, email, password}` → user + token |
| POST | `/api/auth/login` | `{email, password}` → user + token |
| POST | `/api/auth/logout` | 204; the client discards its token |
| GET | `/api/auth/me` | requires `Authorization: Bearer <token>` |
| POST | `/api/auth/forgot-password` | 501 — not implemented |
| POST | `/api/auth/reset-password` | 501 — not implemented |
| GET | `/api/users` | 501 — not implemented |

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":"Your Name","email":"you@example.com","password":"supersecret1"}'
```

The `Content-Type` header is required — without it `express.json()` will not
parse the body and every field looks missing.

Errors come in two shapes: `{"errors":[...]}` for validation failures (400),
and `{"error":"..."}` for everything else.

## Database

### Migrations

Schema changes are made **only** through migrations, never by hand — a manual
`ALTER TABLE` is not recorded, so other machines never receive it.

```bash
docker compose exec backend npm run migrate:create -- add-something
```

Edit the generated file in `Backend/migrations/`, filling in `up` and `down`:

```js
export const up = (pgm) => {
  pgm.addColumn({ schema: 'kantowork', name: 'users' }, {
    avatar_url: { type: 'varchar(500)' },
  });
};

export const down = (pgm) => {
  pgm.dropColumn({ schema: 'kantowork', name: 'users' }, 'avatar_url');
};
```

Then apply it, and commit the file so other machines get it:

```bash
docker compose exec backend npm run migrate:up
```

`migrate:down` reverts the most recent migration. Applied migrations are
recorded in `kantowork.pgmigrations`, so `migrate:up` only ever runs what is
missing — it is safe to run any time.

**Never edit or rename a migration that has already run.** The filename — including
its numeric prefix — is how the tool matches a file to its ledger entry and orders
the run. Renaming one produces
`Not run migration X is preceding already run migration Y` and blocks every
migration until the original name is restored. Write a new migration instead.

### Connecting a client

| Field | Value |
|---|---|
| Host | `localhost` |
| Port | **5433** |
| Database | `kantowork` |
| Schema | **`kantowork`** — not `public` |
| User / password | from `.env` |

```bash
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

The variables are expanded *inside* the container, where Compose has set them.
Writing `psql -U "$POSTGRES_USER"` directly would use your shell's copy, which
is empty, and psql would fail with `role "root" does not exist`.

Tables live in a `kantowork` schema, so `\dt` alone shows nothing — use
`\dt kantowork.*`, or set a default:

```sql
ALTER ROLE your_user SET search_path TO kantowork, public;
```

## Layout

```
Backend/
  app.js            middleware and router mounts
  bin/www           entry point
  db.js             shared pg connection pool
  config/jwt.js     token signing and verification
  routes/           URL to handler mapping
  controllers/      validation, status codes, JSON shape
  services/         business rules — no req/res, no SQL
  db/queries/       parameterized SQL only
  middleware/       requireAuth, validate
  validators/       express-validator rule sets
  migrations/       schema history
frontend/
  src/api.ts        fetch wrapper, attaches the bearer token
  src/App.tsx       auth state and route guards
  src/pages/        Login, Signup
```

Where new code goes: mentions `req`/`res` → a controller; contains SQL →
`db/queries`; a rule about how the app behaves → a service.

## Gotchas

**Changing `POSTGRES_USER` or `POSTGRES_PASSWORD` in `.env` does nothing to an
existing database.** Postgres only reads them when it first creates its data
directory. To apply a change, run `docker compose down -v` — which destroys all
data — or `ALTER USER` the role directly.

**`docker compose down -v` also deletes the `node_modules` volumes.** After it,
rebuild before starting, or you get `Cannot find module`.

**Installing a package locally does not install it in the container.** After
`npm install <pkg>`, either repeat it with `docker compose exec <service> npm
install <pkg>` or rebuild the image.

**`.env` is gitignored.** Cloning onto a new machine gets you no `.env`, and
`docker compose up` fails without one. Copy it across separately — never
commit it.
