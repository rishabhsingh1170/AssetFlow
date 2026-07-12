// Mirrors of the server-side Postgres enums. Single source for filters,
// forms, and badge rendering across every feature.

export const ASSET_STATUSES = [
  "available",
  "allocated",
  "reserved",
  "under_maintenance",
  "lost",
  "retired",
  "disposed",
];

export const ASSET_CONDITIONS = ["new", "good", "fair", "poor", "damaged"];

export const BOOKING_STATUSES = [
  "requested",
  "approved",
  "rejected",
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
];

export const MAINTENANCE_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "technician_assigned",
  "in_progress",
  "resolved",
  "cancelled",
];

export const MAINTENANCE_PRIORITIES = ["low", "medium", "high", "critical"];

export const HOLDER_TYPES = ["employee", "department"];

export const ALLOCATION_STATUSES = ["active", "returned", "cancelled"];

export const TRANSFER_STATUSES = ["requested", "approved", "rejected", "cancelled"];

export const AUDIT_ENTITY_TABLES = [
  "assets",
  "asset_allocations",
  "asset_transfer_requests",
  "resource_bookings",
  "maintenance_requests",
  "app_users",
  "departments",
];
