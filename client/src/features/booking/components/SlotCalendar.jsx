import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../../../components/ui/Card";
import { formatDate } from "../../../utils/formatDate";

// Static map from booking status to token classes. Tailwind cannot see
// dynamically composed class names, so every combination is written out.
const BLOCK_CLASSES = {
  requested: "bg-status-maintenance-bg text-status-maintenance border-status-maintenance-border",
  approved: "bg-status-allocated-bg text-status-allocated border-status-allocated-border",
  upcoming: "bg-status-allocated-bg text-status-allocated border-status-allocated-border",
  ongoing: "bg-status-available-bg text-status-available border-status-available-border",
  completed: "bg-status-retired-bg text-status-retired border-status-retired-border",
  rejected: "bg-status-lost-bg text-status-lost border-status-lost-border",
  cancelled: "bg-status-retired-bg text-status-retired border-status-retired-border",
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const startOfWeek = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  // Shift to Monday (getDay: Sunday = 0).
  const offset = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - offset);
  return result;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const pad = (n) => String(n).padStart(2, "0");
const timeOf = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// Custom seven-day week strip; no calendar library.
export const SlotCalendar = ({ asset, bookings = [], onSlotClick }) => {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const days = useMemo(
    () => [...Array(7)].map((_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const assetBookings = useMemo(
    () => (asset ? bookings.filter((b) => b.asset_id === asset.id) : []),
    [asset, bookings]
  );

  if (!asset) {
    return (
      <Card>
        <p className="text-sm text-text-secondary text-center py-4">
          Select a resource to see its weekly schedule.
        </p>
      </Card>
    );
  }

  const today = new Date();

  const blocksForDay = (day) => {
    const dayStart = new Date(day);
    const dayEnd = addDays(dayStart, 1);
    return assetBookings
      .filter((booking) => {
        const starts = new Date(booking.starts_at);
        const ends = new Date(booking.ends_at);
        return starts < dayEnd && ends > dayStart;
      })
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
      .map((booking) => {
        const starts = new Date(booking.starts_at);
        const ends = new Date(booking.ends_at);
        // Clamp multi-day bookings to the column's day.
        const from = starts < dayStart ? "00:00" : timeOf(starts);
        const to = ends > dayEnd ? "23:59" : timeOf(ends);
        return { ...booking, from, to };
      });
  };

  const handleDayClick = (day) => {
    const slot = new Date(day);
    slot.setHours(9, 0, 0, 0);
    onSlotClick?.(slot);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <p className="eyebrow">
          {asset.asset_tag || "Untagged"} weekly schedule
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekStart((current) => addDays(current, -7))}
            aria-label="Previous week"
            className="p-1.5 rounded-default border border-border text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-xs text-text-secondary">
            {formatDate(days[0].toISOString())} - {formatDate(days[6].toISOString())}
          </span>
          <button
            onClick={() => setWeekStart((current) => addDays(current, 7))}
            aria-label="Next week"
            className="p-1.5 rounded-default border border-border text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const isToday = isSameDay(day, today);
          const blocks = blocksForDay(day);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleDayClick(day)}
              aria-label={`Book ${asset.name} on ${formatDate(day.toISOString())} at 09:00`}
              className={`flex flex-col min-h-32 rounded-default border p-1.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
                isToday
                  ? "border-accent-300 bg-accent-50/60"
                  : "border-border bg-surface-1 hover:bg-surface-2"
              }`}
            >
              <span
                className={`mb-1.5 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.06em] ${
                  isToday ? "text-accent-600 font-semibold" : "text-text-secondary"
                }`}
              >
                {DAY_LABELS[index]}
                <span>{pad(day.getDate())}</span>
              </span>
              <span className="flex flex-col gap-1">
                {blocks.map((block) => (
                  <span
                    key={`${block.id}-${block.from}`}
                    title={block.purpose || undefined}
                    className={`block rounded-default border px-1.5 py-0.5 font-mono text-[10px] leading-4 truncate ${
                      BLOCK_CLASSES[block.status] || BLOCK_CLASSES.completed
                    }`}
                  >
                    {block.from}-{block.to}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default SlotCalendar;
