import React from "react";
import { UserRound, Wrench } from "lucide-react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import StatusPill from "../../../components/common/StatusPill";
import { timeAgo } from "../../../utils/formatDate";
import { formatCurrency } from "../../../utils/formatCurrency";

const OPEN_STATUSES = ["pending", "approved", "technician_assigned", "in_progress"];

export const MaintenanceCard = ({
  request,
  isManager,
  userId,
  loading = false,
  onApprove,
  onReject,
  onAssign,
  onStart,
  onResolve,
  onCancel,
}) => {
  const isRequester = request.requested_by === userId;
  const isOpen = OPEN_STATUSES.includes(request.status);
  const canCancel = isOpen && (isRequester || isManager);

  const actions = [];
  if (request.status === "pending" && isManager) {
    actions.push(
      <Button key="approve" size="sm" onClick={() => onApprove?.(request)} loading={loading}>
        Approve
      </Button>,
      <Button
        key="reject"
        size="sm"
        variant="secondary"
        onClick={() => onReject?.(request)}
        disabled={loading}
      >
        Reject
      </Button>
    );
  }
  if (request.status === "approved" && isManager) {
    actions.push(
      <Button key="assign" size="sm" onClick={() => onAssign?.(request)} loading={loading}>
        Assign technician
      </Button>
    );
  }
  if (request.status === "technician_assigned" && isManager) {
    actions.push(
      <Button key="start" size="sm" onClick={() => onStart?.(request)} loading={loading}>
        Start
      </Button>
    );
  }
  if (request.status === "in_progress" && isManager) {
    actions.push(
      <Button key="resolve" size="sm" onClick={() => onResolve?.(request)} loading={loading}>
        Resolve
      </Button>
    );
  }
  if (canCancel) {
    actions.push(
      <Button
        key="cancel"
        size="sm"
        variant="ghost"
        onClick={() => onCancel?.(request)}
        disabled={loading}
      >
        Cancel
      </Button>
    );
  }

  return (
    <Card padding="none" className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="inline-flex font-mono text-[11px] font-medium text-text-secondary bg-surface-2 border border-border rounded px-1.5 py-0.5">
            {request.asset_tag || "Untagged"}
          </span>
          <p className="text-sm font-semibold text-text-primary truncate mt-1.5">
            {request.asset_name || "Unknown asset"}
          </p>
        </div>
        <StatusPill status={request.priority} domain="priority" className="shrink-0" />
      </div>

      <p className="text-sm text-text-secondary line-clamp-2">
        {request.issue_description}
      </p>

      <div className="flex items-center justify-between gap-2 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1 min-w-0">
          <UserRound size={12} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{request.requested_by_name || "Unknown"}</span>
        </span>
        <span className="font-mono shrink-0">{timeAgo(request.created_at)}</span>
      </div>

      {request.technician_name && (
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <Wrench size={12} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{request.technician_name}</span>
        </div>
      )}

      {request.status === "resolved" && request.actual_cost != null && (
        <p className="text-xs text-text-secondary">
          Actual cost{" "}
          <span className="font-mono font-medium text-text-primary">
            {formatCurrency(request.actual_cost)}
          </span>
        </p>
      )}

      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          {actions}
        </div>
      )}
    </Card>
  );
};

export default MaintenanceCard;
