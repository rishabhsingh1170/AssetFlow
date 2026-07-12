import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import MaintenanceCard from "./MaintenanceCard";
import { humanize } from "../../../utils/assetStatus";

// Enum-constrained transitions: cards advance through explicit buttons,
// never drag-and-drop.
const OPEN_COLUMNS = [
  "pending",
  "approved",
  "technician_assigned",
  "in_progress",
  "resolved",
];

const CLOSED_STATUSES = ["rejected", "cancelled"];

const ColumnEmpty = () => (
  <div className="border border-dashed border-border-strong rounded-card px-3 py-8 text-center">
    <p className="text-xs text-text-muted">No requests here</p>
  </div>
);

export const MaintenanceKanban = ({
  items = [],
  isManager,
  userId,
  actionLoadingId,
  onApprove,
  onReject,
  onAssign,
  onStart,
  onResolve,
  onCancel,
}) => {
  const [closedExpanded, setClosedExpanded] = useState(false);

  const grouped = useMemo(() => {
    const buckets = {};
    OPEN_COLUMNS.forEach((status) => {
      buckets[status] = [];
    });
    buckets.closed = [];
    items.forEach((item) => {
      if (CLOSED_STATUSES.includes(item.status)) {
        buckets.closed.push(item);
      } else if (buckets[item.status]) {
        buckets[item.status].push(item);
      }
    });
    return buckets;
  }, [items]);

  const cardProps = {
    isManager,
    userId,
    onApprove,
    onReject,
    onAssign,
    onStart,
    onResolve,
    onCancel,
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start">
      {OPEN_COLUMNS.map((status) => {
        const columnItems = grouped[status];
        return (
          <div key={status} className="min-w-68 w-68 shrink-0 space-y-3">
            <div className="flex items-center gap-2 px-1">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-text-secondary">
                {humanize(status)}
              </h2>
              <Badge variant="neutral">{columnItems.length}</Badge>
            </div>
            {columnItems.length === 0 ? (
              <ColumnEmpty />
            ) : (
              columnItems.map((request) => (
                <MaintenanceCard
                  key={request.id}
                  request={request}
                  loading={actionLoadingId === request.id}
                  {...cardProps}
                />
              ))
            )}
          </div>
        );
      })}

      {/* Closed column: rejected + cancelled, collapsed by default */}
      <div className="min-w-68 w-68 shrink-0 space-y-3">
        <button
          type="button"
          onClick={() => setClosedExpanded((value) => !value)}
          aria-expanded={closedExpanded}
          className="flex items-center gap-2 px-1 cursor-pointer rounded-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          {closedExpanded ? (
            <ChevronDown size={14} className="text-text-muted" aria-hidden="true" />
          ) : (
            <ChevronRight size={14} className="text-text-muted" aria-hidden="true" />
          )}
          <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-text-muted">
            Closed
          </h2>
          <Badge variant="neutral">{grouped.closed.length}</Badge>
        </button>
        {closedExpanded ? (
          grouped.closed.length === 0 ? (
            <ColumnEmpty />
          ) : (
            grouped.closed.map((request) => (
              <MaintenanceCard
                key={request.id}
                request={request}
                loading={actionLoadingId === request.id}
                {...cardProps}
              />
            ))
          )
        ) : (
          <div className="border border-dashed border-border rounded-card px-3 py-4 text-center">
            <p className="text-xs text-text-muted">
              {grouped.closed.length === 0
                ? "No rejected or cancelled requests"
                : `${grouped.closed.length} rejected or cancelled`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceKanban;
