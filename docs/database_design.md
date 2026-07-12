# AssetFlow Database Design

Database target: Supabase PostgreSQL.

Executable schema: `server/database/schema.sql`.

## Design Goals

AssetFlow needs ERP-style correctness more than loose document storage. The schema is normalized around departments, employees, assets, allocations, bookings, maintenance, audit cycles, notifications, and activity logs.

The database enforces the critical business rules so the API cannot accidentally create invalid states:

- Signup users start as `employee`; promotion to `admin`, `department_head`, or `asset_manager` is represented on `app_users.role`.
- Departments support active/inactive status, parent department hierarchy, and assigned department heads.
- Asset categories support flexible `custom_fields` JSON for category-specific metadata without changing the core asset table.
- Assets have a strict lifecycle: `available`, `allocated`, `reserved`, `under_maintenance`, `lost`, `retired`, `disposed`.
- A partial unique index allows only one active allocation per asset.
- Bookings use PostgreSQL range exclusion constraints so overlapping bookings for the same shared resource are rejected atomically.
- Maintenance requests follow the required workflow and update asset status on approval/resolution.
- Audit cycles retain assigned auditors, per-asset verification results, and discrepancy records.
- Notifications and activity logs are first-class tables for dashboard alerts and traceability.

## ACID And Reliability Choices

PostgreSQL gives durability through WAL and transactional commits. The schema adds application-specific atomicity and consistency with:

- Foreign keys for all important relationships.
- Enum types for workflow state machines.
- Check constraints for valid date ranges, holder types, costs, and return states.
- Partial unique index `one_active_allocation_per_asset` to prevent double-allocation.
- Exclusion constraint `no_overlapping_active_bookings` to prevent overlapping time slots.
- Transaction-safe stored functions:
  - `create_asset_allocation(...)` locks the asset row, checks availability, inserts the allocation, and lets the trigger update asset status in one transaction.
  - `create_resource_booking(...)` locks the resource, validates it is bookable, inserts the booking, and reserves the asset in one transaction.
  - `return_asset_allocation(...)` closes an active allocation and captures check-in condition in one transaction.
  - `approve_transfer_request(...)` closes the current allocation, creates the replacement allocation, and approves the request atomically.
- Triggers keep `updated_at` current and synchronize asset status after allocation and maintenance workflow changes.

## Main Tables

- `app_users`: Supabase `auth.users` profile, department, role, employee status.
- `departments`: organization hierarchy and department head assignment.
- `asset_categories`: asset master data with optional JSON category fields.
- `locations`: reusable location/site records.
- `assets`: central asset registry with tag, serial number, status, condition, cost, bookable flag.
- `asset_allocations`: employee/department allocations and return history.
- `asset_transfer_requests`: requested/approved/rejected transfer workflow.
- `resource_bookings`: time-slot bookings for shared resources.
- `maintenance_requests`: repair approval and technician workflow.
- `audit_cycles`, `audit_cycle_auditors`, `audit_items`, `audit_discrepancies`: structured audit process.
- `notifications`: user-facing alerts.
- `activity_logs`: immutable-style operational event log.
- `file_attachments`: Supabase Storage references for photos/documents.

## Supabase Notes

The schema enables Row Level Security on all application tables and includes `current_app_role()`. Add policies during API implementation based on the exact access model. A safe starting point is:

- Employees can read their own profile, allocations, bookings, maintenance requests, notifications, and relevant assets.
- Department Heads can read department-scoped data and approve department transfer/allocation requests.
- Asset Managers can create/update assets, allocations, maintenance approvals, and discrepancy resolution.
- Admins can manage departments, categories, employees, roles, and audit cycles.
- Server-side admin actions should use the Supabase service role key only on the backend, never in the browser.

## Reporting Support

The schema includes:

- `active_allocation_overdues` view for overdue return alerts.
- `dashboard_kpis` view for dashboard KPI cards.

Further reports can be built from indexed base tables:

- Asset utilization: `asset_allocations` and `resource_bookings`.
- Maintenance frequency: `maintenance_requests` grouped by asset/category.
- Department allocation summary: `asset_allocations` joined with departments.
- Booking heatmaps: `resource_bookings` grouped by day/hour.
- Audit discrepancies: `audit_discrepancies` joined with `audit_cycles` and `assets`.
