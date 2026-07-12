import React, { useMemo } from "react";
import { AlertTriangle, XCircle } from "lucide-react";

// Statuses that hold the slot; anything else does not block a new booking.
const ACTIVE_STATUSES = ["requested", "approved", "upcoming", "ongoing"];

// Server-side overlaps violate a Postgres gist exclusion constraint and
// surface as HTTP 500 mentioning no_overlapping_active_bookings.
const OVERLAP_ERROR = /no_overlapping_active_bookings|exclusion/i;

export const ConflictWarning = ({
  assetId,
  startsAt,
  endsAt,
  bookings = [],
  submitError = null,
}) => {
  const overlapCount = useMemo(() => {
    if (!assetId || !startsAt || !endsAt) return 0;
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return 0;
    }
    return bookings.filter((booking) => {
      if (booking.asset_id !== assetId) return false;
      if (!ACTIVE_STATUSES.includes(booking.status)) return false;
      return start < new Date(booking.ends_at) && end > new Date(booking.starts_at);
    }).length;
  }, [assetId, startsAt, endsAt, bookings]);

  const errorMessage = submitError
    ? OVERLAP_ERROR.test(String(submitError))
      ? "This time slot conflicts with an existing booking."
      : String(submitError)
    : null;

  if (!overlapCount && !errorMessage) return null;

  return (
    <div className="space-y-2">
      {overlapCount > 0 && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-default border border-warning-border bg-warning-bg px-3 py-2.5"
        >
          <AlertTriangle size={16} className="text-warning mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-warning">
            This time range overlaps {overlapCount === 1 ? "an active booking" : `${overlapCount} active bookings`}{" "}
            for this resource. The server will reject conflicting bookings.
          </p>
        </div>
      )}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-default border border-danger-border bg-danger-bg px-3 py-2.5"
        >
          <XCircle size={16} className="text-danger mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-danger">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ConflictWarning;
