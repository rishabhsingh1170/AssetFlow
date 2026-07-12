import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  Wrench,
  ArrowLeftRight,
  Send,
  ClipboardCheck,
} from "lucide-react";
import { timeAgo } from "../../../utils/formatDate";
import { markRead } from "../notification.slice";

const TYPE_META = {
  booking: { icon: Calendar, classes: "bg-info-bg text-info" },
  maintenance: { icon: Wrench, classes: "bg-warning-bg text-warning" },
  allocation: { icon: ArrowLeftRight, classes: "bg-success-bg text-success" },
  transfer: { icon: Send, classes: "bg-accent-100 text-accent-800" },
  audit: { icon: ClipboardCheck, classes: "bg-status-reserved-bg text-status-reserved" },
};

const DEFAULT_META = { icon: Bell, classes: "bg-surface-2 text-text-secondary" };

// Types may arrive as compound values ("booking_approved"), so match on the
// first known keyword the type contains.
const getTypeMeta = (type = "") => {
  const value = String(type).toLowerCase();
  const key = Object.keys(TYPE_META).find((k) => value.includes(k));
  return key ? TYPE_META[key] : DEFAULT_META;
};

const ROUTE_BY_RELATED_TABLE = {
  resource_bookings: "/resource-booking",
  maintenance_requests: "/maintenance",
  assets: "/assets",
  asset_allocations: "/assets",
};

export const NotificationItem = ({ notification }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isUnread = !notification.read_at;
  const meta = getTypeMeta(notification.type);
  const Icon = meta.icon;

  const handleClick = () => {
    if (isUnread) {
      dispatch(markRead(notification.id));
    }
    const path = ROUTE_BY_RELATED_TABLE[notification.related_table];
    if (path) navigate(path);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-start gap-3 text-left px-4 py-3.5 rounded-default hover:bg-surface-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.classes}`}
        aria-hidden="true"
      >
        <Icon size={16} />
      </span>

      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span
            className={`text-sm text-text-primary truncate ${
              isUnread ? "font-semibold" : ""
            }`}
          >
            {notification.title}
          </span>
          {isUnread && (
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-accent-400"
              aria-label="Unread"
            />
          )}
        </span>
        {notification.body && (
          <span className="block text-sm text-text-secondary mt-0.5">
            {notification.body}
          </span>
        )}
      </span>

      <span className="font-mono text-xs text-text-muted shrink-0 text-right whitespace-nowrap mt-0.5">
        {timeAgo(notification.created_at)}
      </span>
    </button>
  );
};

export default NotificationItem;
