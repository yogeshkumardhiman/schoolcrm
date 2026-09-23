# Backend Project Hygiene

This file defines safe cleanup rules so day-to-day debugging does not pollute the main backend codebase.

## Directory intent

- `src/` contains runtime application code only.
- `src/scratch/` and `scratch/` are for temporary debugging scripts only.
- `migrations/` should have one canonical location for production use. Keep migration execution aligned with `src/config/migrate.js`.

## Safe rules for developers

- Do not import anything from `scratch/` or `src/scratch/` in runtime routes/controllers/services.
- Keep ad-hoc scripts prefixed with `check_` or `test_` and run manually.
- Before release, verify scratch scripts are either removed or ignored.
- Keep secrets in `.env`, never commit them.

## CRM lint stabilization order

When fixing CRM lint errors, follow this order to reduce regressions:

1. Authentication and role pages (`login`, `staff/access`).
2. Data entry and billing pages (`fees`, `classes`, `marks`).
3. Academic flows (`promotion`, `report-card`, `id-card`).
4. Remaining warnings (`unused vars`, `img` optimization).

This keeps high-traffic and permission-sensitive screens stable first.
