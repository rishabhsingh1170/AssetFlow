import React, { useState } from "react";
import api from "../../../../api/axios";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Textarea from "../../../components/ui/Textarea";
import { useToast } from "../../../components/ui/Toast";
import { cleanPayload } from "../../../utils/validators";
import { useAuth } from "../../../hooks/useAuth";

// Mirrors server/validations/audit.validation.js closeAuditCycle:
// closedBy optional uuid, resolutionNotes optional string max 2000.
// BACKEND GAP: no /api/audit/cycles route is mounted yet; this modal is only
// reachable when AUDIT_CYCLES_ENABLED is flipped in AuditPage.jsx.
export const CloseCycleModal = ({ isOpen, onClose, cycle, onClosed }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setResolutionNotes("");
    setError(null);
    onClose?.();
  };

  const handleConfirm = async () => {
    if (resolutionNotes.length > 2000) {
      setError("Resolution notes must be at most 2000 characters");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.patch(
        `/audit/cycles/${cycle?.id}/close`,
        cleanPayload({ closedBy: user?.id, resolutionNotes })
      );
      toast({
        title: "Audit cycle closed",
        description: cycle?.name ? `"${cycle.name}" is now closed.` : undefined,
        variant: "success",
      });
      onClosed?.(res.data);
      handleClose();
    } catch (err) {
      setError(
        err.errors?.[0]?.message || err.message || "Failed to close audit cycle"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Close audit cycle" size="sm">
      <div className="space-y-5">
        <p className="text-sm text-text-secondary">
          Closing{" "}
          <span className="font-semibold text-text-primary">
            {cycle?.name || "this cycle"}
          </span>{" "}
          finalizes its checklist. Unverified items stay flagged as discrepancies.
          This cannot be undone.
        </p>

        {error && (
          <div className="rounded-default border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <Textarea
          id="close-cycle-notes"
          label="Resolution notes (optional)"
          placeholder="Summarize findings and how discrepancies were resolved"
          maxLength={2000}
          value={resolutionNotes}
          onChange={(event) => setResolutionNotes(event.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={submitting}>
            Close cycle
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CloseCycleModal;
