import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, X } from "lucide-react";
import { clearActionError } from "../allocation.slice";

const CONFLICT_MESSAGE = /currently (allocated|reserved|under_maintenance)/i;

// Shown when an allocate/return/transfer action hits a custody conflict
// (the server 409s when the asset is not available). Other action errors
// are surfaced inline in the form that raised them.
export const AllocationConflictBanner = () => {
  const dispatch = useDispatch();
  const actionError = useSelector((state) => state.allocation.actionError);

  if (!actionError) return null;

  const isConflict =
    actionError.status === 409 || CONFLICT_MESSAGE.test(actionError.message || "");

  if (!isConflict) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-default border border-danger-border bg-danger-bg px-4 py-3"
    >
      <AlertTriangle size={18} className="text-danger mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-danger">Custody conflict</p>
        <p className="text-sm text-danger mt-0.5">
          {actionError.message ||
            "This asset is not available for that action right now."}
        </p>
      </div>
      <button
        onClick={() => dispatch(clearActionError())}
        aria-label="Dismiss conflict message"
        className="p-1 rounded-default text-danger hover:bg-danger-border/40 transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default AllocationConflictBanner;
