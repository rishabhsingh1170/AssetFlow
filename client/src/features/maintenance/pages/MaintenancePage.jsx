import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Modal from "../../../components/ui/Modal";
import Textarea from "../../../components/ui/Textarea";
import Input from "../../../components/ui/Input";
import Skeleton from "../../../components/ui/Skeleton";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../../hooks/useAuth";
import { useRole } from "../../../hooks/useRole";
import { MAINTENANCE_PRIORITIES } from "../../../constants/assetStatuses";
import { humanize } from "../../../utils/assetStatus";
import MaintenanceKanban from "../components/MaintenanceKanban";
import RaiseRequestForm from "../components/RaiseRequestForm";
import TechnicianAssignModal from "../components/TechnicianAssignModal";
import {
  fetchMaintenanceRequests,
  fetchAssetOptions,
  fetchTechnicians,
  reviewRequest,
  progressRequest,
  setFilters,
  initialState as maintenanceInitialState,
} from "../maintenance.slice";

const PRIORITY_OPTIONS = [
  { value: "", label: "All priorities" },
  ...MAINTENANCE_PRIORITIES.map((value) => ({ value, label: humanize(value) })),
];

const KanbanSkeleton = () => (
  <div className="flex gap-4 overflow-x-hidden">
    {[0, 1, 2, 3, 4].map((column) => (
      <div key={column} className="min-w-68 w-68 shrink-0 space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    ))}
  </div>
);

export const MaintenancePage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin, isAssetManager } = useRole();
  const isManager = isAdmin || isAssetManager;

  const {
    items,
    loading,
    error,
    filters,
    assetOptions,
    actionLoadingId,
  } = useSelector((state) => state.maintenance || maintenanceInitialState);

  const [searchParams, setSearchParams] = useSearchParams();

  // Modal state
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [raiseAssetId, setRaiseAssetId] = useState("");
  const [assignTarget, setAssignTarget] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [resolveError, setResolveError] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Deep link: /maintenance?assetId=... pre-opens the raise form with the
  // asset preselected, then strips the param so it does not reopen.
  useEffect(() => {
    const assetId = searchParams.get("assetId");
    if (assetId) {
      setRaiseAssetId(assetId);
      setRaiseOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("assetId");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(fetchAssetOptions());
  }, [dispatch]);

  useEffect(() => {
    if (isManager) dispatch(fetchTechnicians());
  }, [dispatch, isManager]);

  useEffect(() => {
    dispatch(fetchMaintenanceRequests(filters));
  }, [dispatch, filters]);

  const mineOnly = Boolean(filters.requestedBy);

  const assetFilterOptions = useMemo(
    () => [
      { value: "", label: "All assets" },
      ...assetOptions.map((asset) => ({
        value: asset.id,
        label: `${asset.asset_tag ? `${asset.asset_tag} ` : ""}${asset.name}`,
      })),
    ],
    [assetOptions]
  );

  const runAction = async (thunkAction, successTitle) => {
    try {
      await dispatch(thunkAction).unwrap();
      toast({ title: successTitle, variant: "success" });
      return true;
    } catch (err) {
      toast({
        title: "Action failed",
        description: typeof err === "string" ? err : err?.message,
        variant: "danger",
      });
      return false;
    }
  };

  const handleApprove = (request) =>
    runAction(
      reviewRequest({ id: request.id, status: "approved", actorId: user?.id }),
      "Request approved"
    );

  const handleReject = async () => {
    if (!rejectTarget) return;
    const ok = await runAction(
      reviewRequest({ id: rejectTarget.id, status: "rejected", actorId: user?.id }),
      "Request rejected"
    );
    if (ok) setRejectTarget(null);
  };

  const handleStart = (request) =>
    runAction(
      progressRequest({ id: request.id, status: "in_progress" }),
      "Maintenance started"
    );

  const openResolve = (request) => {
    setResolveTarget(request);
    setResolutionNotes("");
    setActualCost("");
    setResolveError(null);
  };

  const handleResolve = async (event) => {
    event.preventDefault();
    if (!resolveTarget) return;
    if (actualCost !== "" && Number(actualCost) < 0) {
      setResolveError("Actual cost cannot be negative");
      return;
    }
    const ok = await runAction(
      progressRequest({
        id: resolveTarget.id,
        status: "resolved",
        resolutionNotes: resolutionNotes.trim(),
        actualCost: actualCost === "" ? undefined : Number(actualCost),
      }),
      "Request resolved"
    );
    if (ok) setResolveTarget(null);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    const ok = await runAction(
      progressRequest({ id: cancelTarget.id, status: "cancelled" }),
      "Request cancelled"
    );
    if (ok) setCancelTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service"
        title="Maintenance"
        description="Raise, review, and track maintenance requests across every asset."
        actions={
          <Button
            onClick={() => {
              setRaiseAssetId("");
              setRaiseOpen(true);
            }}
          >
            <Plus size={16} className="mr-1.5" aria-hidden="true" />
            Raise request
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          aria-label="Filter by priority"
          className="w-44"
          value={filters.priority}
          onChange={(event) => dispatch(setFilters({ priority: event.target.value }))}
          options={PRIORITY_OPTIONS}
        />
        <Select
          aria-label="Filter by asset"
          className="w-64"
          value={filters.assetId}
          onChange={(event) => dispatch(setFilters({ assetId: event.target.value }))}
          options={assetFilterOptions}
        />
        <button
          type="button"
          aria-pressed={mineOnly}
          onClick={() =>
            dispatch(setFilters({ requestedBy: mineOnly ? "" : user?.id || "" }))
          }
          className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
            mineOnly
              ? "bg-accent-100 text-accent-800 border-accent-300"
              : "bg-surface-1 border-border text-text-secondary hover:text-text-primary hover:border-border-strong"
          }`}
        >
          My requests
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 bg-danger-bg border border-danger-border text-danger text-sm rounded-default px-4 py-3">
          <span>{error}</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => dispatch(fetchMaintenanceRequests(filters))}
          >
            Try again
          </Button>
        </div>
      )}

      {loading ? (
        <KanbanSkeleton />
      ) : (
        <MaintenanceKanban
          items={items}
          isManager={isManager}
          userId={user?.id}
          actionLoadingId={actionLoadingId}
          onApprove={handleApprove}
          onReject={setRejectTarget}
          onAssign={setAssignTarget}
          onStart={handleStart}
          onResolve={openResolve}
          onCancel={setCancelTarget}
        />
      )}

      {/* Raise request */}
      <RaiseRequestForm
        isOpen={raiseOpen}
        onClose={() => setRaiseOpen(false)}
        defaultAssetId={raiseAssetId}
      />

      {/* Assign technician */}
      <TechnicianAssignModal
        isOpen={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        request={assignTarget}
      />

      {/* Resolve */}
      <Modal
        isOpen={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        title="Resolve request"
        size="sm"
      >
        <form onSubmit={handleResolve} className="space-y-4" noValidate>
          {resolveError && (
            <div className="bg-danger-bg border border-danger-border text-danger text-sm rounded-default px-3 py-2">
              {resolveError}
            </div>
          )}
          <Textarea
            id="resolve-notes"
            label="Resolution notes"
            placeholder="What was done to fix the issue"
            maxLength={2000}
            value={resolutionNotes}
            onChange={(event) => setResolutionNotes(event.target.value)}
          />
          <Input
            id="resolve-cost"
            label="Actual cost"
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
            value={actualCost}
            onChange={(event) => setActualCost(event.target.value)}
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="secondary"
              onClick={() => setResolveTarget(null)}
              disabled={actionLoadingId === resolveTarget?.id}
            >
              Cancel
            </Button>
            <Button type="submit" loading={actionLoadingId === resolveTarget?.id}>
              Mark resolved
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject confirmation */}
      <ConfirmDialog
        isOpen={Boolean(rejectTarget)}
        title="Reject request"
        description={`Reject the maintenance request for ${
          rejectTarget?.asset_tag || rejectTarget?.asset_name || "this asset"
        }? The requester will see it in the Closed column.`}
        confirmLabel="Reject request"
        loading={actionLoadingId === rejectTarget?.id}
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />

      {/* Cancel confirmation */}
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        title="Cancel request"
        description={`Cancel the maintenance request for ${
          cancelTarget?.asset_tag || cancelTarget?.asset_name || "this asset"
        }? This cannot be undone.`}
        confirmLabel="Cancel request"
        cancelLabel="Keep request"
        loading={actionLoadingId === cancelTarget?.id}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};

export default MaintenancePage;
