// Status metadata per domain. `pill` keys map to the static class map in
// components/common/StatusPill.jsx; `badgeVariant` maps to ui/Badge variants.

export const humanize = (value = "") =>
  String(value)
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const STATUS_META = {
  asset: {
    available: { label: "Available", pill: "available", badgeVariant: "success" },
    allocated: { label: "Allocated", pill: "allocated", badgeVariant: "info" },
    reserved: { label: "Reserved", pill: "reserved", badgeVariant: "info" },
    under_maintenance: { label: "Maintenance", pill: "maintenance", badgeVariant: "warning" },
    lost: { label: "Lost", pill: "lost", badgeVariant: "danger" },
    retired: { label: "Retired", pill: "retired", badgeVariant: "inactive" },
    disposed: { label: "Disposed", pill: "disposed", badgeVariant: "neutral" },
  },
  booking: {
    requested: { label: "Requested", pill: "maintenance", badgeVariant: "warning" },
    approved: { label: "Approved", pill: "allocated", badgeVariant: "info" },
    upcoming: { label: "Upcoming", pill: "allocated", badgeVariant: "info" },
    ongoing: { label: "Ongoing", pill: "available", badgeVariant: "success" },
    completed: { label: "Completed", pill: "retired", badgeVariant: "neutral" },
    rejected: { label: "Rejected", pill: "lost", badgeVariant: "danger" },
    cancelled: { label: "Cancelled", pill: "retired", badgeVariant: "neutral" },
  },
  maintenance: {
    pending: { label: "Pending", pill: "maintenance", badgeVariant: "warning" },
    approved: { label: "Approved", pill: "allocated", badgeVariant: "info" },
    technician_assigned: { label: "Assigned", pill: "allocated", badgeVariant: "info" },
    in_progress: { label: "In progress", pill: "maintenance", badgeVariant: "warning" },
    resolved: { label: "Resolved", pill: "available", badgeVariant: "success" },
    rejected: { label: "Rejected", pill: "lost", badgeVariant: "danger" },
    cancelled: { label: "Cancelled", pill: "retired", badgeVariant: "neutral" },
  },
  priority: {
    low: { label: "Low", pill: "retired", badgeVariant: "neutral" },
    medium: { label: "Medium", pill: "allocated", badgeVariant: "info" },
    high: { label: "High", pill: "maintenance", badgeVariant: "warning" },
    critical: { label: "Critical", pill: "lost", badgeVariant: "danger" },
  },
  allocation: {
    active: { label: "Active", pill: "available", badgeVariant: "success" },
    returned: { label: "Returned", pill: "retired", badgeVariant: "neutral" },
    cancelled: { label: "Cancelled", pill: "retired", badgeVariant: "neutral" },
  },
  transfer: {
    requested: { label: "Requested", pill: "maintenance", badgeVariant: "warning" },
    approved: { label: "Approved", pill: "available", badgeVariant: "success" },
    rejected: { label: "Rejected", pill: "lost", badgeVariant: "danger" },
    cancelled: { label: "Cancelled", pill: "retired", badgeVariant: "neutral" },
  },
};

export const getStatusMeta = (domain, value) => {
  const meta = STATUS_META[domain]?.[value];
  if (meta) return meta;
  return { label: humanize(value) || "Unknown", pill: "retired", badgeVariant: "neutral" };
};

export default STATUS_META;
