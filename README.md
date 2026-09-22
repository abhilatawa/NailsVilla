# Nails Villa.

A production website and appointment booking platform for **Nails Villa**, a personal
nail-art business in Halifax, Nova Scotia.

See [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) for the full
architecture, database design, booking algorithm, and phased build plan.

## Stack

- **Frontend**: React 19, TypeScript, Vite, React Router, TanStack Query, React Hook
  Form, Zod, Tailwind CSS v4, shadcn-style components (Radix primitives + `cva`).
- **Backend**: Java 21, Spring Boot 3.5 (modular monolith), Spring Security, Spring
  Data JPA / Hibernate, PostgreSQL, Flyway.
- **Infrastructure**: Docker Compose (Postgres + backend + Nginx-served frontend).

## Prerequisites

- Java 21 (`JAVA_HOME` pointed at a JDK 21 install)
- Node.js 22+
- Docker Desktop (with Docker Compose v2)

## Running everything with Docker Compose

```bash
cp .env.example .env   # edit values as needed
docker compose up --build
```

- Frontend: http://localhost:8081
- Backend API: http://localhost:8080/api/v1
- Backend health: http://localhost:8080/actuator/health
- Postgres: localhost:5432 (credentials from `.env`)

## Running the backend directly (without Docker)

```bash
cd backend
docker compose up -d postgres   # from the repo root, or run your own local Postgres
export JAVA_HOME=$(/usr/libexec/java_home -v 21)   # macOS; adjust for your platform
./mvnw spring-boot:run
```

The backend reads configuration from environment variables (see `.env.example` and
`backend/src/main/resources/application.yml`), falling back to local-dev defaults
(`localhost:5432/nailsvilla`, `nailsvilla`/`nailsvilla`) when they're unset.

### Backend tests

```bash
cd backend
./mvnw verify
```

Integration tests use [Testcontainers](https://testcontainers.com) to run against a
real PostgreSQL container — Docker must be running.

> **Known local-environment note:** on an older Docker Desktop (Engine API < 1.44),
> Testcontainers may fail to connect with an error like
> `client version 1.44 is too new`. The real fix is upgrading Docker Desktop. As a
> stopgap, you can run tests with:
> ```bash
> DOCKER_HOST=unix://$HOME/.docker/run/docker.sock \
> TESTCONTAINERS_RYUK_DISABLED=true \
> ./mvnw verify -DargLine=-Dapi.version=1.43
> ```
> This is not baked into the build itself — CI runners have a current Docker Engine
> and don't need it.

## Running the frontend directly (without Docker)

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:8080` (see `vite.config.ts`),
so the backend must be running separately (see above) for API calls to succeed.

### Frontend checks

```bash
cd frontend
npm run typecheck
npm run lint
npm run test
npm run build
```

## Project layout

```
backend/    Spring Boot modular monolith (see docs/ARCHITECTURE.md)
frontend/   React SPA
docs/       Architecture, database, API, security, and deployment documentation
```

## Content placeholders

Per the project brief, several business details are intentionally left as
placeholders until the owner supplies them: exact street address, phone number,
email, social media links, owner biography, certifications, and customer reviews.
These are never fabricated — see `docs/IMPLEMENTATION_PLAN.md` §8 for the full list.
