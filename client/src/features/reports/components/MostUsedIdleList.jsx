import React, { useMemo } from "react";
import { formatDate } from "../../../utils/formatDate";

// Booking statuses that represent real usage of an asset.
const ACTIVE_BOOKING_STATUSES = ["approved", "upcoming", "ongoing", "completed"];

const bookedMs = (booking) => {
  const start = new Date(booking.starts_at);
  const end = new Date(booking.ends_at);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, end.getTime() - start.getTime());
};

export const MostUsedIdleList = ({ assets = [], bookings = [] }) => {
  const { mostUsed, idle } = useMemo(() => {
    const hoursByTag = {};
    const nameByTag = {};

    bookings
      .filter((booking) => ACTIVE_BOOKING_STATUSES.includes(booking.status))
      .forEach((booking) => {
        if (!booking.asset_tag) return;
        hoursByTag[booking.asset_tag] =
          (hoursByTag[booking.asset_tag] || 0) + bookedMs(booking) / 3600000;
        if (booking.asset_name) nameByTag[booking.asset_tag] = booking.asset_name;
      });

    const used = Object.entries(hoursByTag)
      .map(([tag, hours]) => ({
        tag,
        name: nameByTag[tag] || tag,
        hours: Math.round(hours * 10) / 10,
      }))
      .filter((entry) => entry.hours > 0)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    const idleAssets = assets
      .filter(
        (asset) => asset.status === "available" && !(hoursByTag[asset.asset_tag] > 0)
      )
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(0, 5);

    return { mostUsed: used, idle: idleAssets };
  }, [assets, bookings]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-3">Most used</p>
        {mostUsed.length === 0 ? (
          <p className="text-sm text-text-muted">No booked hours recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {mostUsed.map((entry) => (
              <li key={entry.tag} className="flex items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary truncate">{entry.name}</p>
                  <p className="font-mono text-[11px] text-text-muted">{entry.tag}</p>
                </div>
                <span className="font-mono text-[13px] text-text-primary shrink-0">
                  {entry.hours} hrs
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="eyebrow mb-3">Idle</p>
        {idle.length === 0 ? (
          <p className="text-sm text-text-muted">
            No available assets without bookings. Everything is in use.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {idle.map((asset) => (
              <li key={asset.id} className="flex items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary truncate">{asset.name}</p>
                  <p className="font-mono text-[11px] text-text-muted">
                    {asset.asset_tag || "Untagged"}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-text-muted shrink-0">
                  since {formatDate(asset.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MostUsedIdleList;
