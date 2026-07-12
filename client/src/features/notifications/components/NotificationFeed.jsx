import React, { useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/common/EmptyState";
import { formatDate } from "../../../utils/formatDate";
import NotificationItem from "./NotificationItem";

const PAGE_SIZE = 20;

const dayLabel = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Earlier";

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diffDays = Math.round((today - target) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return formatDate(iso);
};

export const NotificationFeed = ({ items = [] }) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const groups = useMemo(() => {
    const visible = items.slice(0, visibleCount);
    const byDay = [];
    visible.forEach((item) => {
      const label = dayLabel(item.created_at);
      const last = byDay[byDay.length - 1];
      if (last && last.label === label) {
        last.items.push(item);
      } else {
        byDay.push({ label, items: [item] });
      }
    });
    return byDay;
  }, [items, visibleCount]);

  if (items.length === 0) {
    return (
      <EmptyState
        illustration="inbox"
        title="Nothing here"
        description="No notifications match this filter."
      />
    );
  }

  const hasMore = items.length > visibleCount;

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.label}>
          <p className="eyebrow mb-2">{group.label}</p>
          <div className="divide-y divide-border rounded-card border border-border bg-surface-1 shadow-card">
            {group.items.map((item) => (
              <NotificationItem key={item.id} notification={item} />
            ))}
          </div>
        </section>
      ))}

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationFeed;
