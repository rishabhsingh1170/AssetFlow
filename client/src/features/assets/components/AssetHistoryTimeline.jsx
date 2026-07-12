import React, { useEffect, useState } from "react";
import { getAuditLogs } from "../../../../api/audit.api";
import Skeleton from "../../../components/ui/Skeleton";
import { formatDate } from "../../../utils/formatDate";
import { humanize } from "../../../utils/assetStatus";

// Local component state on purpose: history is scoped to the open drawer
// and does not need to live in Redux.
export const AssetHistoryTimeline = ({ asset }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!asset?.id) return undefined;
    let active = true;

    const load = async () => {
      setLoading(true);

      // Synthetic events derived from the asset row itself, so the timeline
      // is useful even before server-side activity logging exists.
      const merged = [];
      if (asset.created_at) {
        merged.push({
          key: `registered-${asset.id}`,
          label: "Registered",
          at: asset.created_at,
        });
      }
      if (asset.retired_at) {
        merged.push({
          key: `retired-${asset.id}`,
          label: "Retired",
          at: asset.retired_at,
        });
      }
      if (asset.disposed_at) {
        merged.push({
          key: `disposed-${asset.id}`,
          label: "Disposed",
          at: asset.disposed_at,
        });
      }

      try {
        // BACKEND GAP: nothing writes activity_logs yet, so this usually
        // returns an empty list. The timeline lights up automatically once
        // controllers start logging.
        const res = await getAuditLogs({ entityTable: "assets", limit: 200 });
        const logs = (res.data || []).filter(
          (log) => log.entity_id === asset.id
        );
        logs.forEach((log) => {
          merged.push({
            key: log.id,
            label: humanize(log.action) || "Activity",
            detail: log.actor_name ? `by ${log.actor_name}` : null,
            at: log.created_at,
          });
        });
      } catch {
        // Audit endpoint unavailable: fall back to synthetic events only.
      }

      merged.sort((a, b) => new Date(b.at) - new Date(a.at));

      if (active) {
        setEvents(merged);
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [asset?.id, asset?.created_at, asset?.retired_at, asset?.disposed_at]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!events.length) {
    return (
      <p className="text-sm text-text-muted">
        No activity has been recorded for this asset yet.
      </p>
    );
  }

  return (
    <ol className="relative ml-1.5 border-l border-border pl-4 space-y-4">
      {events.map((event) => (
        <li key={event.key} className="relative">
          <span
            aria-hidden="true"
            className="absolute left-[-21.5px] top-1 w-2.5 h-2.5 rounded-full bg-accent-400 border-2 border-surface-1"
          />
          <p className="text-sm font-medium text-text-primary">{event.label}</p>
          {event.detail && (
            <p className="text-xs text-text-secondary">{event.detail}</p>
          )}
          <p className="font-mono text-[11px] text-text-muted mt-0.5">
            {formatDate(event.at, { withTime: true })}
          </p>
        </li>
      ))}
    </ol>
  );
};

export default AssetHistoryTimeline;
