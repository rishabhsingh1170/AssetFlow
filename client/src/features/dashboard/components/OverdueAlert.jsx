import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Button from "../../../components/ui/Button";
import { formatDate } from "../../../utils/formatDate";

export const OverdueAlert = ({ count, items = [] }) => {
  const navigate = useNavigate();
  if (!count) return null;

  return (
    <div className="bg-danger-bg border border-danger-border rounded-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-danger mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-danger">
              {count} {count === 1 ? "asset is" : "assets are"} overdue for return
            </p>
            <ul className="mt-2 space-y-1.5">
              {items.slice(0, 3).map((row) => (
                <li key={row.id} className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-1 border border-danger-border text-danger">
                    {row.asset_tag}
                  </span>
                  <span className="text-text-primary font-medium">{row.asset_name}</span>
                  <span>
                    held by {row.holder_user_name || row.holder_department_name || "unknown holder"}
                  </span>
                  <span className="font-mono">due {formatDate(row.expected_return_at)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/allocation-transfer")}>
          Review returns
        </Button>
      </div>
    </div>
  );
};

export default OverdueAlert;
