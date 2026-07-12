import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCheck } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import EmptyState from "../../../components/common/EmptyState";
import Button from "../../../components/ui/Button";
import Skeleton from "../../../components/ui/Skeleton";
import { useAuth } from "../../../hooks/useAuth";
import {
  fetchNotifications,
  markAllRead,
  selectUnreadCount,
} from "../notification.slice";
import NotificationFilterTabs from "../components/NotificationFilterTabs";
import NotificationFeed from "../components/NotificationFeed";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items, loading, error, unavailable, filter } = useSelector(
    (state) => state.notifications
  );
  const unreadCount = useSelector(selectUnreadCount);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotifications(user.id));
    }
  }, [dispatch, user?.id]);

  const filteredItems = useMemo(() => {
    if (filter === "unread") return items.filter((n) => !n.read_at);
    if (filter === "read") return items.filter((n) => n.read_at);
    return items;
  }, [items, filter]);

  // BACKEND GAP: /api/notifications is not mounted on the server, so the
  // fetch 404s and the slice flips `unavailable` instead of erroring.
  if (unavailable) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Inbox" title="Notifications" />
        <EmptyState
          illustration="inbox"
          title="Notifications aren't wired up yet"
          description="The server does not mount /api/notifications yet (notification.service.js is empty). Once it does, alerts about bookings, returns, and maintenance appear here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Alerts about bookings, returns, transfers, and maintenance."
        actions={
          <Button
            variant="ghost"
            disabled={unreadCount === 0}
            onClick={() => dispatch(markAllRead())}
          >
            <CheckCheck size={16} className="mr-2" aria-hidden="true" />
            Mark all as read
          </Button>
        }
      />

      <NotificationFilterTabs />

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-default border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(fetchNotifications(user?.id))}
          >
            Try again
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        !error && <NotificationFeed items={filteredItems} />
      )}
    </div>
  );
};

export default NotificationsPage;
