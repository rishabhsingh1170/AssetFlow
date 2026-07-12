import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import StatusPill from "../../../components/common/StatusPill";
import { timeAgo } from "../../../utils/formatDate";

const OPEN_STATUSES = ["pending", "approved", "technician_assigned", "in_progress"];

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const MAX_ROWS = 8;

export const DueForMaintenanceList = ({ rows = [] }) => {
  const open = useMemo(
    () =>
      rows
        .filter((row) => OPEN_STATUSES.includes(row.status))
        .sort((a, b) => {
          const byPriority =
            (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4);
          if (byPriority !== 0) return byPriority;
          return new Date(a.created_at) - new Date(b.created_at);
        }),
    [rows]
  );

  if (open.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        No open maintenance requests. Nothing is waiting on service.
      </p>
    );
  }

  const visible = open.slice(0, MAX_ROWS);
  const overflow = open.length - visible.length;

  return (
    <div>
      <ul className="divide-y divide-border">
        {visible.map((row) => (
          <li key={row.id}>
            <Link
              to="/maintenance"
              className="block py-2.5 -mx-2 px-2 rounded-default hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary truncate">
                    {row.asset_name || "Unknown asset"}
                  </p>
                  <p className="font-mono text-[11px] text-text-muted">
                    {row.asset_tag || "Untagged"}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-text-muted shrink-0">
                  {timeAgo(row.created_at)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <StatusPill status={row.priority} domain="priority" />
                <StatusPill status={row.status} domain="maintenance" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {overflow > 0 && (
        <p className="text-xs text-text-muted mt-2">
          Plus {overflow} more open {overflow === 1 ? "request" : "requests"} on the
          maintenance board.
        </p>
      )}
    </div>
  );
};

export default DueForMaintenanceList;
