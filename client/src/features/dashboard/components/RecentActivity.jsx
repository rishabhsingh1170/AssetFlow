import React from "react";
import { Calendar, ArrowLeftRight, Wrench } from "lucide-react";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/common/EmptyState";
import { timeAgo } from "../../../utils/formatDate";
import { getStatusMeta } from "../../../utils/assetStatus";

const TYPE_META = {
  booking: {
    icon: Calendar,
    chip: "bg-status-allocated-bg text-status-allocated",
    title: (row) => `Booking for ${row.asset_name || row.asset_tag || "a resource"}`,
    domain: "booking",
  },
  transfer: {
    icon: ArrowLeftRight,
    chip: "bg-status-reserved-bg text-status-reserved",
    title: (row) => `Transfer request for ${row.asset_name || row.asset_tag || "an asset"}`,
    domain: "transfer",
  },
  maintenance: {
    icon: Wrench,
    chip: "bg-status-maintenance-bg text-status-maintenance",
    title: (row) => `Maintenance on ${row.asset_name || row.asset_tag || "an asset"}`,
    domain: "maintenance",
  },
};

export const RecentActivity = ({ bookings = [], transfers = [], maintenance = [] }) => {
  const merged = [
    ...bookings.map((row) => ({ ...row, type: "booking" })),
    ...transfers.map((row) => ({ ...row, type: "transfer" })),
    ...maintenance.map((row) => ({ ...row, type: "maintenance" })),
  ]
    .filter((row) => row.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  return (
    <Card>
      <p className="eyebrow mb-4">Recent activity</p>
      {merged.length === 0 ? (
        <EmptyState
          illustration="inbox"
          title="No activity yet"
          description="Bookings, transfers, and maintenance requests will show up here as they happen."
          className="py-6"
        />
      ) : (
        <ul className="space-y-3">
          {merged.map((row) => {
            const meta = TYPE_META[row.type];
            const Icon = meta.icon;
            const statusMeta = row.status ? getStatusMeta(meta.domain, row.status) : null;
            return (
              <li key={`${row.type}-${row.id}`} className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.chip}`}>
                  <Icon size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{meta.title(row)}</p>
                  <p className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                    {row.asset_tag && (
                      <span className="font-mono text-[11px] px-1.5 py-px rounded bg-surface-2 border border-border">
                        {row.asset_tag}
                      </span>
                    )}
                    {statusMeta && <span>{statusMeta.label}</span>}
                  </p>
                </div>
                <span className="font-mono text-xs text-text-muted shrink-0">
                  {timeAgo(row.created_at)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default RecentActivity;
