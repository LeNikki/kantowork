# kantowork
My own business

## Database (PostgreSQL in Docker)

The database runs in a Docker container. Requires Docker Desktop running.

```bash
# Start the database (first run pulls the image)
docker compose up -d

# Check status (should show "healthy")
docker compose ps

# View logs
docker compose logs -f

# Stop the container (data is kept in the volume)
docker compose down

# Stop and delete the volume (destroys all data!)
docker compose down -v
```

Credentials live in `.env` (copy `.env.example` to `.env` and fill in values if missing).

### Connection string

```
postgres://kanto:<password from .env>@localhost:5433/kantowork
```

Port is **5433** because native PostgreSQL uses 5432 on this machine.

> **Note:** Postgres is not a web server — you can't open `localhost:5433` in a browser.
> Connect to it with a client (your Express app, `psql`, TablePlus, etc.) instead.

### Useful psql commands

```bash
# Open an interactive psql shell inside the container
docker exec -it kantowork-db psql -U kanto -d kantowork

# Run a single query
docker exec -it kantowork-db psql -U kanto -d kantowork -c "SELECT 1;"
```
