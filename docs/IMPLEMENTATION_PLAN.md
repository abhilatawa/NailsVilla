# Nails Villa — Implementation Plan

Status: **Draft for review — no application code has been written yet.**
Scope: This document plans the full production build. Implementation proceeds in the
phases below, each verified (build + tests) before moving to the next.

## 0. Repository Inspection Findings (Phase 0)

- Directory was empty; not a git repository. Git has now been initialized (`main` branch, no commits).
- Toolchain available on this machine:
  - Java: **21.0.2 (Oracle)** at `/Library/Java/JavaVirtualMachines/jdk-21.jdk` — will be pinned via `.sdkmanrc`/`pom.xml` `<release>21</release>` and `JAVA_HOME` note in README. (Also JBR 17.x and Corretto 11 present but not used.)
  - Maven 3.9.6
  - Node 21.6.1 / npm 10.2.4
  - Docker 24.0.7 with Compose v2.23.3
  - Git 2.39.5
  - No local `psql` client — not required; PostgreSQL will run via Docker, and the backend talks to it over JDBC.
- Nothing existing to preserve; no destructive risk at this stage.

---

## 1. Architecture Overview

```
┌────────────────────┐      HTTPS/JSON      ┌──────────────────────┐        JDBC        ┌──────────────┐
│  React SPA (Vite)  │ ───────────────────▶ │  Spring Boot 3 API   │ ─────────────────▶ │  PostgreSQL  │
│  TypeScript + TQ    │ ◀─────────────────── │  (modular monolith)  │ ◀───────────────── │              │
└────────────────────┘                       └──────────────────────┘                    └──────────────┘
                                                        │
                                                        ├── Local filesystem / S3-compatible storage (gallery images)
                                                        └── SMTP (notifications)
```

- **Frontend**: React + TypeScript SPA, served as static assets in production (behind Nginx in its own container, or a CDN later). Talks only to the versioned REST API.
- **Backend**: Single deployable Spring Boot application, internally organized as a **modular monolith** — one Maven module, package-per-domain, each domain exposing a narrow public API (controller + a small set of service interfaces) and keeping repositories/entities package-private where practical. No microservices, no message broker.
- **Database**: PostgreSQL, single schema, Flyway-versioned migrations, UUID primary keys.
- **Why a monolith**: this is a small personal business with one backend developer/operator. A monolith is simpler to deploy, cheaper to run, and removes distributed-systems failure modes (network partitions, eventual consistency) that would actively hurt the one place correctness matters most — booking.

### 1.1 Domain module boundaries

```
backend/src/main/java/com/nailsvilla/
  common/          shared value objects (Money, TimeRange), exceptions, API error envelope
  config/          Spring config: CORS, OpenAPI, Jackson, async, scheduling
  security/        JWT filter, password encoder, method security, rate limiting hooks
  auth/            register/login/logout/password reset — issues tokens
  users/           User entity/repo, role model
  customers/       Customer profile (1:1 with User for account bookings)
  services/        ServiceCategory, Service, pricing model
  availability/    BusinessHours, BlockedTime, slot-computation engine
  appointments/    Appointment entity, booking engine, status transitions, idempotency
  gallery/         GalleryImage, storage abstraction
  reviews/         Review entity, moderation workflow
  promotions/       Promotion entity
  notifications/   NotificationService abstraction + email implementation + templates
  settings/        BusinessSettings (name, currency, timezone, address placeholders)
  dashboard/       Read-only aggregation queries for admin dashboard
```

Cross-domain calls happen through service interfaces only (e.g. `appointments` calls
`availability` and `services`, never reaches into their repositories). This keeps the
option open to extract a module later without a rewrite, without paying microservice
costs now.

### 1.2 Frontend structure

```
frontend/src/
  app/            router setup, providers (QueryClient, Auth context), layout shells
  pages/          route-level components (Home, Services, ServiceDetail, Gallery, About,
                  Contact, Booking, Dashboard/*, Admin/*, Auth/*)
  features/       feature-scoped logic + hooks (booking/, appointments/, auth/, reviews/)
  components/ui/  design-system primitives (Button, Input, Select, DatePicker, TimeSlot,
                  Card, Badge, Modal, Dialog, Toast, Skeleton, EmptyState, ErrorState,
                  Navbar, Footer)
  lib/            api client (typed fetch wrapper), query keys, zod schemas, utils
  styles/         Tailwind config + design tokens (CSS variables for color/spacing/type)
  types/          shared TypeScript types generated/mirrored from API contracts
```

- Business logic (validation rules, slot formatting, price formatting) lives in `lib/`
  and `features/*/hooks`, not inline in page components.
- Design tokens (colors, radii, shadows, font stacks) are CSS custom properties in one
  `tokens.css`, consumed by Tailwind via `theme.extend` — so the palette can change in
  one file without touching components.

---

## 2. Database Design

All tables use `uuid` primary keys (`gen_random_uuid()` via `pgcrypto`/`pgcrypto` or
`uuid-ossp`), `timestamptz` for all timestamps, and explicit `created_at`/`updated_at`.
Money is stored as **integer minor units** (`price_minor_units integer`, e.g. cents) plus
a `currency` column (default `CAD`) — never `float`/`double`. Backend maps this to
`java.math.BigDecimal` at the API boundary for readability (e.g. `60.00`).

### 2.1 Entity summary

| Table | Purpose | Key columns |
|---|---|---|
| `users` | login identity | email (unique, citext), password_hash, role, status |
| `customers` | booking profile, 1:1 with users OR guest | user_id (nullable for guests), first/last name, phone, notes |
| `service_categories` | grouping | name, display_order, active |
| `services` | bookable offering | category_id, price_type, price_minor, starting_price_minor, min/max price_minor, duration_minutes, buffer_minutes, active, featured, display_order |
| `business_hours` | per-weekday template | day_of_week (0-6), is_closed, open_time, close_time |
| `special_hours` | date-specific override (holiday, special day) | date, is_closed, open_time, close_time |
| `blocked_times` | ad-hoc closures | start_at, end_at (timestamptz), reason |
| `appointments` | bookings | customer_id, service_id, start_at, end_at (timestamptz, UTC), status, notes, cancellation_reason, idempotency_key |
| `gallery_images` | portfolio | storage_key, category, alt_text, display_order, active |
| `reviews` | testimonials | appointment_id (unique), customer_id, rating, comment, status (PENDING/APPROVED/REJECTED/HIDDEN) |
| `promotions` | marketing banners | title, description, discount_type, discount_value, start_date, end_date, active |
| `business_settings` | singleton config | salon_name, timezone, currency, city, province, country, address/phone/email placeholders, min_booking_notice_minutes, cancellation_window_hours, reminder_hours_before |
| `notifications` | outbox / audit log | recipient, type, channel, payload, status, sent_at |

Key design points:

- **`business_hours`** stores the recurring weekly template (7 rows, one per weekday,
  seeded 08:00–19:00 every day per the brief, individually editable).
- **`special_hours`** overrides a specific calendar date (holiday hours, one-off early
  close) without disturbing the weekly template.
- **`blocked_times`** is for arbitrary ranges (vacation, a private appointment) that are
  independent of the day's normal hours.
- **Appointment times are stored as `timestamptz`** (absolute instant), computed from
  wall-clock Halifax time using `ZoneId.of("America/Halifax")` at the point of booking —
  this makes DST transitions correct automatically (Halifax is `AST`/`ADT`, offset
  changes twice a year); we never hard-code `-04:00`.
- **No plaintext money as float anywhere** — DB integer minor units, Java `BigDecimal`
  at API/service boundaries constructed via `BigDecimal.valueOf(minorUnits, 2)`-style
  helpers in `common.Money`.

### 2.2 Concurrency-critical constraint

To make double-booking structurally impossible (not just logically checked), add a
PostgreSQL **exclusion constraint** using `btree_gist` on `appointments`:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_no_overlap
  EXCLUDE USING gist (
    tstzrange(start_at, end_at, '[)') WITH &&
  )
  WHERE (status IN ('PENDING', 'CONFIRMED'));
```

This means even if two application-level transactions race past the service-layer
availability check, the database itself refuses the second overlapping insert with a
`23P01` (exclusion violation), which the backend maps to `409 APPOINTMENT_UNAVAILABLE`.
This is the primary defense; the service-layer check (Section 4) is the fast-path/UX
layer that avoids relying on a raw SQL error for the common case.

### 2.3 Migration plan (Flyway)

```
V1__initial_schema.sql        core tables, extensions, enums
V2__appointments_no_overlap.sql   exclusion constraint + supporting indexes
V3__seed_business_hours.sql   Mon–Sun 08:00–19:00, America/Halifax settings row
V4__seed_service_categories_and_services.sql   dev seed catalog
V5__seed_gallery_placeholder.sql  (optional) placeholder gallery categories only, no fake images
V6__indexes.sql               composite indexes for hot queries
```

Migrations are additive-only going forward; no destructive migration ships without a
reviewed rollback note in `docs/DATABASE.md`.

---

## 3. API Design

Base path: `/api/v1`. JSON in/out. Errors use the envelope from Section 42 of the brief
(`timestamp, status, code, message, path, traceId`), produced by a single
`@RestControllerAdvice`.

Public:
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

GET    /api/v1/services
GET    /api/v1/services/{id}
GET    /api/v1/service-categories

GET    /api/v1/gallery
GET    /api/v1/reviews

GET    /api/v1/availability?date=&serviceId=

POST   /api/v1/appointments               (Idempotency-Key header required)
GET    /api/v1/appointments/my
GET    /api/v1/appointments/{id}
POST   /api/v1/appointments/{id}/cancel
PATCH  /api/v1/appointments/{id}

POST   /api/v1/contact
POST   /api/v1/reviews

GET    /api/v1/settings/public           (hours, location, currency, timezone for footer/contact)
GET    /api/v1/promotions/active
```

Admin (all require `ROLE_ADMIN`, all under `/api/v1/admin`):
```
GET    /api/v1/admin/dashboard

GET    /api/v1/admin/appointments
POST   /api/v1/admin/appointments
PATCH  /api/v1/admin/appointments/{id}

POST   /api/v1/admin/services
PATCH  /api/v1/admin/services/{id}

POST   /api/v1/admin/service-categories
PATCH  /api/v1/admin/service-categories/{id}

GET    /api/v1/admin/business-hours
PATCH  /api/v1/admin/business-hours
POST   /api/v1/admin/blocked-times
DELETE /api/v1/admin/blocked-times/{id}

POST   /api/v1/admin/gallery
PATCH  /api/v1/admin/gallery/{id}

GET    /api/v1/admin/customers

GET    /api/v1/admin/reviews
PATCH  /api/v1/admin/reviews/{id}

GET    /api/v1/admin/promotions
POST   /api/v1/admin/promotions
PATCH  /api/v1/admin/promotions/{id}

GET    /api/v1/admin/settings
PATCH  /api/v1/admin/settings
```

Deviations from the brief's sketch, and why: business-hours/blocked-times and
service-categories/promotions admin endpoints were added explicitly since Sections 32–34
and 36 require managing them and the brief's short API list omitted them.

---

## 4. Booking / Availability Algorithm

### 4.1 Availability computation — `GET /api/v1/availability?date=&serviceId=`

Pure read, no locking needed. Steps:

1. Load `Service` by id; 404 if missing; return empty slots if `active=false`.
2. Resolve the effective hours for `date`:
   - `special_hours` row for that date if present, else
   - `business_hours` row for that weekday.
   - If closed → return `{ slots: [] }`.
3. Compute `slotLength = service.durationMinutes + service.bufferMinutes`.
4. Generate candidate slots by walking from `open_time` to `close_time` in
   `slotLength` increments (last slot must fully fit before close).
5. Fetch existing `appointments` for that date with status in `(PENDING, CONFIRMED)`
   and all `blocked_times` overlapping the date, in one query each (indexed on
   `start_at`).
6. Filter out any candidate slot that overlaps an appointment or blocked time using the
   half-open interval rule: `candidate.start < other.end && candidate.end > other.start`.
7. Filter out any candidate whose start is earlier than
   `now(America/Halifax) + minimumBookingNoticeMinutes` (from `business_settings`).
8. Return remaining slots as local wall-clock `HH:mm` strings plus the resolved
   `timezone`, per the brief's example response shape.

All date/time math uses `java.time` (`ZonedDateTime`, `ZoneId.of("America/Halifax")`,
`LocalDate`, `LocalTime`) — never raw offsets — so DST transitions (spring-forward /
fall-back) are handled by the JDK's tz database, including the one edge case worth
naming explicitly: on the fall-back day a naive "is this local time before that local
time" check is ambiguous for the repeated hour, so all interval math is done on the
resolved `ZonedDateTime`/`Instant`, never on bare `LocalTime` comparisons across dates.

### 4.2 Booking creation — `POST /api/v1/appointments`

This is CRUD-shaped but not CRUD-safe; it is a guarded state transition with two layers
of protection:

**Layer 1 — Service-layer validation (fast, user-friendly rejection):**
Within a single `@Transactional` method, in order:
1. Load service; verify `active`.
2. Verify requested date is not in the past and respects minimum booking notice.
3. Resolve effective business hours for the date; verify open.
4. Verify `[start, end)` fits fully inside the open interval.
5. Verify `end = start + duration + buffer` is internally consistent with what the
   client sent (recompute `end` server-side; never trust a client-supplied `end`).
6. Re-run the same overlap query as availability (appointments + blocked times) *inside
   the transaction*, using `SELECT ... FOR UPDATE` scoped to appointments on that date
   for that resource (the single technician), to serialize concurrent attempts on the
   same day before hitting the DB constraint.
7. If clear, `INSERT` the appointment with status `PENDING` (or `CONFIRMED` if the
   business chooses auto-confirm — configurable in settings).

**Layer 2 — Database exclusion constraint (authoritative, race-proof):**
Two concurrent transactions can both pass step 6 in rare interleavings even with row
locking (e.g. if the locked rows differ because neither slot existed yet). The
`appointments_no_overlap` exclusion constraint (Section 2.2) is checked by Postgres at
`INSERT`/`UPDATE` time regardless of application logic, so the second writer's `INSERT`
fails with a constraint violation. The service layer catches `DataIntegrityViolationException`
wrapping a `23P01` and translates it to `409 APPOINTMENT_UNAVAILABLE` — this is the
guarantee, not the row lock, which is purely an optimization to avoid hitting the DB
error in the common case.

**Idempotency:** `POST /api/v1/appointments` requires an `Idempotency-Key: <uuid>`
header. The server stores `(idempotency_key, customer_id) → appointment_id` in a small
`idempotency_keys` table (key unique, short TTL e.g. 24h) inside the same transaction as
the insert. A repeated request with the same key returns the original `201` response
(or the original error) without re-executing the booking logic — so a double-click or
client retry cannot create two appointments even before the overlap constraint would
catch it.

### 4.3 Concurrency test (Section 17/54)

An integration test (Testcontainers Postgres) will:
1. Seed one service + open hours.
2. Fire two concurrent `POST /api/v1/appointments` requests (via `ExecutorService` /
   parallel threads or `CompletableFuture`) for the exact same slot, different
   customers, different idempotency keys.
3. Assert exactly one `201 Created` and one `409 Conflict`.
4. Assert `SELECT count(*) FROM appointments WHERE ...` for that slot is `1`.

---

## 5. Authentication & Authorization

- Passwords: BCrypt (`Spring Security` `PasswordEncoder`, cost factor 12).
- Session model: **stateless JWT** access token (short-lived, ~15 min) + rotating
  refresh token stored as an httpOnly, `Secure`, `SameSite=Strict` cookie. Rationale:
  SPA + REST API, avoids CSRF-prone cookie-carried-auth for the API calls themselves
  (bearer token in `Authorization` header), while the refresh cookie is the one thing
  that needs CSRF care (mitigated by `SameSite=Strict` + double-submit not needed since
  it's not used for state-changing calls directly).
- CORS: explicit allow-list of the frontend origin(s) from config, credentials allowed
  only for the refresh endpoint.
- Method-level authorization: `@PreAuthorize` on every controller method; admin
  controllers additionally require `ROLE_ADMIN` at the `SecurityFilterChain` level as a
  defense-in-depth backstop. Every customer-scoped query (`/appointments/my`, cancel,
  reschedule) filters by the authenticated principal's `customer_id` server-side —
  never trusts an id from the client for ownership (IDOR protection).
- Guest booking: allowed. A guest booking creates a `customers` row with `user_id NULL`
  and stores contact info directly; if the same email later registers, admin can link
  manually. This satisfies "low friction" without forcing account creation, while
  keeping the data model simple (no dual booking tables).
- Rate limiting / brute force: bucket4j (in-memory token bucket, IP+email keyed) on
  `/auth/login`, `/auth/register`, `/auth/forgot-password`, and `/appointments` POST.
  Documented as upgradeable to Redis-backed if traffic grows.

---

## 6. Frontend Design System & Brand Tokens

`frontend/src/styles/tokens.css` defines CSS variables (`--color-ivory`, `--color-blush`,
`--color-rose`, `--color-charcoal`, `--font-display`, `--font-body`, `--radius-*`,
`--shadow-*`), consumed by `tailwind.config.ts` via `theme.extend.colors` referencing
`var(--color-*)`. Components never hard-code hex values. This lets the owner (or a
future designer) swap the whole palette in one file. Initial palette uses the
warm-ivory/blush/rose/charcoal direction from the brief as *placeholder-but-real*
values (not a system that still needs a palette to render).

---

## 7. Testing Strategy

- **Backend unit tests**: JUnit 5 + Mockito for service-layer logic (availability
  computation, overlap detection, pricing formatting, timezone edge cases including a
  DST-boundary test).
- **Backend integration tests**: Spring Boot Test + Testcontainers (real Postgres,
  Flyway applied) for repository queries, the exclusion constraint, and the concurrency
  test above.
- **Frontend unit tests**: Vitest + React Testing Library for booking flow components,
  form validation (Zod schemas), and the design-system primitives.
- **E2E**: Playwright covering the critical paths listed in Section 53 of the brief
  (register/login, browse, gallery, full booking flow, cancel, admin login, admin
  appointment + service management).
- CI (GitHub Actions, added in Phase 2 foundation): on push/PR — backend `mvn verify`
  (includes Testcontainers tests), frontend `npm run typecheck && lint && test && build`.

---

## 8. Risks & Assumptions

**Assumptions (per Section 58 — nothing below is invented as real business fact):**
- Owner name, exact address, phone, email, socials, certifications, years of
  experience, and reviews are all placeholders (`config`/`business_settings` seed data
  clearly marked as dev/placeholder) until supplied.
- Single technician (the owner) — availability model assumes one appointment at a time,
  not multi-chair scheduling. This is why the overlap constraint is global per time
  range rather than per-resource; if a second technician is ever added, `appointments`
  gains a `staff_id` and the exclusion constraint's `WHERE`/partition key extends to it.
- Auto-confirm vs. manual-confirm of new bookings is left admin-configurable
  (`business_settings.auto_confirm_appointments`), defaulting to auto-confirm (status
  `CONFIRMED`) for lowest booking friction, since the brief's primary goal is
  maximizing completed bookings.
- Image storage abstraction ships with a **local filesystem** implementation for dev
  (Section 47); S3/R2/Cloudinary adapters are structurally supported via a
  `StorageService` interface but not implemented against real cloud credentials in this
  environment.
- Email sending in dev uses a **stub/console `NotificationService`** implementation
  (logs instead of sending) unless real SMTP credentials are provided via `.env`; the
  interface is provider-agnostic so real SMTP (e.g. via `spring-boot-starter-mail`) is a
  drop-in swap.

**Risks:**
- **DST correctness** is the single highest-risk area in booking; mitigated by
  exclusively using `ZonedDateTime`/`Instant` internally and an explicit DST-transition
  test case (booking near the March/November Halifax clock change).
- **Double-booking under real concurrency** is mitigated by two independent layers
  (Section 4.2); the exclusion constraint is the actual guarantee, so it ships in the
  same migration as the `appointments` table, not as a later hardening pass.
- **Scope size** — this is a full production system. Phases are structured so each is
  independently shippable and verified (build/tests green) rather than delivered as one
  large untested drop.
- **No existing brand assets** (real photography, logo, exact colors) — placeholder
  imagery/copy will be clearly structured to be swapped, not left as broken links.

---

## 9. Implementation Phases (tracking)

| Phase | Content | Status |
|---|---|---|
| 0 | Inspect repo & toolchain | Done |
| 1 | This plan | Done — reviewed |
| 2 | Foundation: Vite app, Spring Boot app, Postgres, Flyway, Docker, CI, env config | Done |
| 3 | Backend core: auth, services, hours, blocked times, availability, booking engine + concurrency test | Done |
| 4 | Public website: home, services, gallery, about, contact, booking UI | Done |
| 5 | Customer: auth UI, dashboard, appointments, profile, reviews | Not started |
| 6 | Admin panel: dashboard, appointments, services, gallery, customers, reviews, promotions, settings | Not started |
| 7 | Notifications: booking/cancel/reminder/password-reset emails | Not started |
| 8 | Quality pass: security, accessibility, responsive, SEO, performance, full test suite | Not started |

Next step after this plan is reviewed: **Phase 2 — Foundation**, producing a working
`docker compose up` with an empty-but-real Spring Boot app connected to Postgres via
Flyway, and an empty-but-real Vite/React app, both building and passing CI.

### Phase 2 notes (as built)

- **Toolchain upgrades required**: the installed Node (21.6.1, a non-LTS release) could
  not run current frontend tooling (Vite 8/create-vite require Node ^20.19 or ≥22.12).
  With the user's approval, Node was upgraded system-wide via Homebrew to 22.x.
- **Versions pinned**: Spring Boot 3.5.16 (latest 3.x — Spring Initializr now only
  offers 4.x, but the brief specifies Spring Boot 3.x), React 19, Tailwind CSS v4,
  TanStack Query v5, React Router v7. TypeScript is pinned at the version Vite's own
  `react-ts` template ships (~6.0.2) rather than the bleeding-edge `latest` tag (7.x),
  since the template's own choice is the tested-compatible baseline for this exact
  toolchain combination.
- **Full DB schema shipped early**: rather than an empty placeholder schema, Phase 2
  includes the complete V1–V4 migrations from Section 2 of this plan (all core tables,
  the double-booking exclusion constraint, and dev seed data), since the design was
  already finalized and this unblocks Phase 3 immediately.
- **Vertical slice proven end-to-end**: a real `GET /api/v1/settings/public` endpoint
  (Flyway → JPA → REST) is consumed by the frontend footer via TanStack Query, and
  `docker compose up` was verified to bring up Postgres → backend → Nginx-served
  frontend with the frontend correctly proxying `/api` to the backend.
- **Local Docker Desktop is outdated** (Engine API 1.43, expects 1.44+ by default from
  current Testcontainers). A documented workaround unblocks local test runs (see
  README); CI runners are unaffected since they ship a current Docker Engine. This is
  not patched into the build itself, to avoid masking a real environment issue.
- **Security is a placeholder in this phase only**: `SecurityConfig` permits all
  requests with CORS/CSRF/session-policy wired correctly; the actual JWT filter and
  per-endpoint authorization land in Phase 3.

### Phase 3 notes (as built)

- **Real JWT auth + revocable refresh tokens**: access tokens are short-lived JWTs
  (`JwtService`); refresh tokens are opaque, server-side, SHA-256-hashed, and rotated on
  every use (`RefreshTokenService`) — set as an httpOnly/Secure/SameSite=Strict cookie
  scoped to `/api/v1/auth`, never returned in a JSON body. Logout actually revokes the
  token server-side, which a stateless-JWT-only refresh design could not do.
- **Booking engine implemented exactly per Section 16's guard sequence**
  (`AppointmentService.validateSlot`): service active → business open → within hours →
  minimum notice → no overlap. The DB exclusion constraint from Phase 2 is the
  authoritative guarantee; the service-layer check is the fast, friendly-rejection path.
  `saveAndFlush` + catching `DataIntegrityViolationException` is what translates a raw
  Postgres constraint violation into a `409 APPOINTMENT_UNAVAILABLE`.
- **Idempotency**: `Idempotency-Key` header is cached per `(key, customerId)` in the
  `idempotency_keys` table; a replay returns the original response instead of
  re-running booking logic. Verified in `AppointmentBookingFlowTest`.
- **Concurrency test passes**: `AppointmentBookingConcurrencyTest` fires two real HTTP
  requests for the identical slot from two threads and asserts exactly one `201` and
  one `409`, with exactly one row persisted for that slot.
- **Guest booking**: implemented via find-or-create-by-email `Customer` rows with
  `userId = null`, matching the Phase-1 plan. Guest bookings cannot later be viewed or
  cancelled through the API (no login exists for them) — a documented limitation, not
  an oversight; contacting the business directly is the fallback for a small personal
  studio.
- **Two real bugs found and fixed during verification** (both would have silently
  broken the site):
  1. `business_hours.day_of_week` was declared `SMALLINT` in the schema but the JPA
     entity mapped it as a plain `int`, which Hibernate expects as `INTEGER` — caused a
     schema-validation failure at startup. Fixed via a new migration (`V6`) rather than
     editing the already-applied `V1`.
  2. `hibernate.jdbc.time_zone: UTC` (set in Phase 2) was silently shifting plain
     `LocalTime` business-hours values by the local machine's UTC offset when read back
     — e.g. seeded "08:00" was coming back as "04:00". Removed; it was never needed
     since actual instants use `Instant`/`timestamptz` throughout, which are
     timezone-agnostic already. Caught by `AppointmentBookingFlowTest` asserting real
     availability slots against the seeded 08:00–19:00 hours, not a hardcoded time.
  3. Also fixed: Testcontainers was starting a **new** Postgres container per test
     class instead of reusing one, because the `@Testcontainers`/`@Container` JUnit
     extension's per-class lifecycle hooks don't correctly share a `static` container
     across classes in this setup — exhausted connections partway through the suite.
     Switched `AbstractIntegrationTest` to the documented Testcontainers "singleton
     container" pattern (started once in a `static { }` block).
- **Entity naming**: the `services` table's entity is named `NailService`, not
  `Service`, to avoid colliding with `org.springframework.stereotype.Service` in every
  file that needs both.
- **API response times formatted as `HH:mm`** (`@JsonFormat`) to match the brief's
  Section 19 example exactly, rather than Jackson's default `HH:mm:ss`.
- **Admin endpoints intentionally deferred**: per the Phase 3 scope (auth, services,
  hours, availability, booking — not admin), no `/api/v1/admin/**` controllers exist
  yet; `SecurityConfig` already gates that path prefix to `ROLE_ADMIN` in preparation
  for Phase 6.

### Phase 4 notes (as built)

- **Three small backend additions** were needed beyond Phase 3's scope, since the
  public site genuinely needs them (not frontend-hardcoded stand-ins): read-only
  `GET /api/v1/gallery` and `GET /api/v1/reviews` (both legitimately return `[]` today
  — no real photos or reviews exist yet, Section 58 forbids inventing either), a real
  `POST /api/v1/contact` backed by `NotificationService`, and `GET /api/v1/business-hours`
  so the homepage/contact page display real, admin-configurable hours instead of a
  hardcoded "8 AM–7 PM" string. `PublicSettingsResponse` also gained
  `cancellationWindowHours` — the booking review step must show the cancellation policy
  *before* the customer confirms, not just after.
- **No photography anywhere on the site — deliberately.** The brief's "don't fabricate
  reviews" rule (Section 58) applies just as much to nail art photos claimed as this
  specific business's portfolio: using generic stock nail-art images and presenting
  them as Nails Villa's actual work would misrepresent the business the same way a
  fake review would. The Gallery page and homepage gallery section show an honest
  "being curated" empty state instead; the design leans on typography, color, and
  layout rather than photography to still feel premium. The Gallery grid + lightbox
  (Radix Dialog) are fully built and will render real photos the moment the owner
  uploads them via the admin panel (Phase 6).
- **Guest-only booking flow in this phase.** Login/Register are still placeholder
  pages — Phase 5 is what builds real authentication UI. Since the booking wizard must
  work for anonymous visitors regardless (Section 4's primary conversion path), it was
  built guest-only now; Phase 5 will add auth-state detection to skip the guest-details
  step for logged-in customers.
- **Route-level code splitting** added (`React.lazy` per page) after the production
  build flagged a 574 KB main chunk — directly the "route-level code splitting"
  requirement from Section 46, not deferred to the Phase 8 quality pass since the
  build tooling surfaced it immediately.
- **One real bug found via live browser testing, not just automated tests**: the
  frontend's `apiClient` only treated HTTP 204 as an empty body; the contact endpoint
  returns `202 Accepted` with no body, so `response.json()` threw on an empty string
  and the contact form silently failed even though the backend request succeeded.
  Fixed by reading the response as text first and parsing only if non-empty — general
  enough to cover any endpoint that acknowledges without returning data. Caught by
  manually walking the deployed `docker compose` stack in a real browser (full booking
  flow, contact form, category filtering, gallery/reviews empty states), which is why
  that walkthrough is worth doing every phase, not just trusting `npm run build`
  succeeding.
- **Full booking wizard** (service → date → time → details → review → confirmation)
  verified end-to-end against the real backend: real availability slots, real pricing
  per `priceType` (FIXED/STARTING_FROM/RANGE all confirmed rendering correctly), a
  real booking reference on confirmation, and idempotent double-submit protection.
