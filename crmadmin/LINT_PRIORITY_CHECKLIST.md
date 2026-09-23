# CRM Lint Priority Checklist

Use this order to fix errors without destabilizing core flows.

## Phase 1: Blocking auth/role surfaces

- `src/app/login/page.tsx`
- `src/app/staff/access/page.tsx`
- `src/components/AbilityProvider.tsx` (if affected by rule typing)

Focus:
- Remove `any` in request/response types.
- Fix `react/no-unescaped-entities`.

## Phase 2: Finance and core operations

- `src/app/fees/page.tsx`
- `src/app/fees/setup/page.tsx`
- `src/app/fees/structure/page.tsx`
- `src/app/fees/[id]/page.tsx`
- `src/app/marks/page.tsx`
- `src/app/classes/page.tsx`

Focus:
- Replace `any` with minimal interfaces.
- Resolve `react-hooks/set-state-in-effect` by deriving state during render or event handlers where possible.

## Phase 3: Academic modules

- `src/app/academic/promotion/page.tsx`
- `src/app/academic/report-card/[studentId]/page.tsx`
- `src/app/academic/report-card/bulk/[className]/[section]/page.tsx`
- `src/app/academic/id-card/search/page.tsx`

Focus:
- Data contract typing.
- Escape quote entities in JSX text.

## Phase 4: Remaining warnings and UX quality

Focus:
- Remove unused imports/variables.
- Replace raw `<img>` with Next `Image` where practical.
- Add `alt` attributes for accessibility.

## Safety checks after each phase

1. Run `npm run lint`.
2. Run `npm run build` (from `crmadmin`).
3. Smoke-check login, staff list, fees list, and marks page.
