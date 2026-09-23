# NestJS (Fastify) + TypeORM Backend Context & Rules

This document outlines the architecture, security guards, coding conventions, and configuration for the `sdmpublic/backend-nestjs` application.

---

## 🔒 Security & Code Quality Rules (Enforced)

1. **Zero `let` Keywords:**
   - Every single variable in the entire codebase MUST be declared using `const`.
   - Never use mutable `let` declarations or variable reassignments.

2. **Zero In-Code Seeds or Credentials:**
   - Auth services, controllers, and strategies query PostgreSQL strictly via TypeORM repositories.
   - Never hardcode fallbacks, emergency accounts, or sample student/admin credentials in application code.

3. **Strict Passport & Guard Security:**
   - **`JwtAuthGuard`:** Applied globally in `AppModule` as `APP_GUARD`. Blocks unauthorized HTTP requests unless explicitly decorated with `@Public()`.
   - **`RolesGuard`:** Applied globally in `AppModule` as `APP_GUARD`. Enforces string role requirements specified via `@Roles(...)`.
   - **`PermissionsGuard`:** Applied globally in `AppModule` as `APP_GUARD`. Enforces fine-grained permission codes specified via `@RequirePermissions(...)`.
   - **`ValidationPipe`:** Applied globally in `AppModule` as `APP_PIPE`.
   - **`HttpExceptionFilter`:** Applied globally in `AppModule` as `APP_FILTER`.

---

## 🏗️ Project Architecture

```
src/
├── main.ts                        # Fastify application entrypoint
├── app.module.ts                  # Root module (registers APP_PIPE, APP_FILTER, APP_GUARD)
├── core/
│   ├── database/
│   │   └── database.module.ts     # TypeORM connection (autoLoadEntities: true)
│   └── filters/
│       └── http-exception.filter.ts # Express-compatible error response filter
├── common/
│   ├── enums/                     # Permission & RoleType enums
│   ├── decorators/                # @Public(), @CurrentUser(), @Roles(), @RequirePermissions()
│   └── guards/                    # RolesGuard, PermissionsGuard
└── modules/
    ├── rbac/                      # Role & Permission entities, RBAC service & controller
    ├── auth/                      # Login, Passport strategies, AuthModule
    ├── staff/                     # Staff directory, leave requests, timetables, service & controller
    ├── students/                  # Student CRUD, DTOs, service & controller
    ├── attendance/                # Student daily & bulk class attendance, summaries
    ├── fees/                      # Fee heads, class fee structures, dues, payments
    ├── salary/                    # Staff salary structures, allowances, net salary, payroll
    ├── transport/                 # Bus routes, stops, bus assignments, monthly fees
    └── academic/                  # Homework assignments, submissions, exam marks & results
```

---

## 🛣️ Implemented API Endpoints

### Auth & RBAC
- `POST /auth/login` — Public endpoint protected by `StaffLocalAuthGuard`
- `POST /auth/student/login` — Public endpoint protected by `StudentLocalAuthGuard`
- `GET /auth/me` — Protected by `JwtAuthGuard`
- `POST /auth/device-token` — Protected by `JwtAuthGuard`
- `GET /rbac/roles` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.RBAC_ROLE_MANAGE)`
- `GET /rbac/permissions` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.RBAC_PERMISSION_ASSIGN)`
- `POST /rbac/roles` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.RBAC_ROLE_MANAGE)`
- `PUT /rbac/roles/:id/permissions` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.RBAC_PERMISSION_ASSIGN)`

### Students Module (`src/modules/students/`)
- `GET /students` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STUDENT_READ)`
- `GET /students/:id` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STUDENT_READ)`
- `GET /students/admission/:admissionNo` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STUDENT_READ)`
- `POST /students` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STUDENT_CREATE)`
- `PUT /students/:id` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STUDENT_UPDATE)`
- `DELETE /students/:id` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STUDENT_DELETE)`

### Staff Module (`src/modules/staff/`)
- `GET /staff` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STAFF_READ)`
- `GET /staff/:id` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STAFF_READ)`
- `POST /staff` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STAFF_CREATE)`
- `PUT /staff/:id` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STAFF_UPDATE)`
- `DELETE /staff/:id` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STAFF_DELETE)`
- `POST /staff/leave` — Protected by `JwtAuthGuard` (Apply staff leave)
- `GET /staff/leaves` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STAFF_READ)`
- `PUT /staff/leave/:id/status` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STAFF_UPDATE)`

### Attendance Module (`src/modules/attendance/`)
- `GET /attendance/student/:queryId` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.ATTENDANCE_READ)`
- `GET /attendance/class` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.ATTENDANCE_READ)`
- `GET /attendance/summary/:queryId` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.ATTENDANCE_READ)`
- `POST /attendance/mark` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.ATTENDANCE_MARK)`
- `POST /attendance/bulk-mark` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.ATTENDANCE_MARK)`

### Fees Module (`src/modules/fees/`)
- `GET /fees/heads` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.FEE_STRUCTURE_MANAGE)`
- `POST /fees/heads` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.FEE_STRUCTURE_MANAGE)`
- `GET /fees/structures` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.FEE_STRUCTURE_MANAGE)`
- `POST /fees/structures` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.FEE_STRUCTURE_MANAGE)`
- `GET /fees/dues/:studentId` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.FEE_READ)`
- `GET /fees/payments/:studentId` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.FEE_READ)`
- `POST /fees/pay` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.FEE_COLLECT)`

### Salary Module (`src/modules/salary/`)
- `GET /salary/structures` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.SALARY_READ)`
- `GET /salary/structure/:staffId` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.SALARY_READ)`
- `POST /salary/structure` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.SALARY_STRUCTURE_MANAGE)`
- `GET /salary/payments/:staffId` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.SALARY_READ)`
- `POST /salary/pay` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.SALARY_PAY)`

### Transport Module (`src/modules/transport/`)
- `GET /transport/routes` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.TRANSPORT_READ)`
- `GET /transport/routes/:id` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.TRANSPORT_READ)`
- `POST /transport/routes` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.TRANSPORT_MANAGE)`
- `POST /transport/stops` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.TRANSPORT_MANAGE)`
- `DELETE /transport/routes/:id` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.TRANSPORT_MANAGE)`
- `DELETE /transport/stops/:id` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.TRANSPORT_MANAGE)`

### Academic Module (`src/modules/academic/`)
- `GET /academic/homework` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.STUDENT_READ)`
- `POST /academic/homework` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.HOMEWORK_MANAGE)`
- `POST /academic/homework/submit` — Protected by `JwtAuthGuard`
- `GET /academic/results/student/:studentId` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.ACADEMIC_READ)`
- `POST /academic/results` — Protected by `JwtAuthGuard` + `@RequirePermissions(Permission.EXAM_MANAGE)`
