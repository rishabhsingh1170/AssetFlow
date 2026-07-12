import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import { useToast } from "../../../components/ui/Toast";
import { humanize } from "../../../utils/assetStatus";
import { assignTech } from "../maintenance.slice";

export const TechnicianAssignModal = ({ isOpen, onClose, request }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { technicians = [], actionLoadingId } = useSelector(
    (state) => state.maintenance || {}
  );

  const [technicianUserId, setTechnicianUserId] = useState("");
  const [error, setError] = useState(null);

  const loading = Boolean(request) && actionLoadingId === request?.id;

  useEffect(() => {
    if (isOpen) {
      setTechnicianUserId("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!technicianUserId) {
      setError("Technician is required");
      return;
    }
    try {
      await dispatch(assignTech({ id: request.id, technicianUserId })).unwrap();
      toast({
        title: "Technician assigned",
        description: `${request.asset_tag || "Request"} moved to Technician Assigned.`,
        variant: "success",
      });
      onClose?.();
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Failed to assign technician");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign technician">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="bg-danger-bg border border-danger-border text-danger text-sm rounded-default px-3 py-2">
            {error}
          </div>
        )}

        <p className="text-sm text-text-secondary">
          Assign a person to work on{" "}
          <span className="font-mono text-[13px] text-text-primary">
            {request?.asset_tag || "this asset"}
          </span>
          . There is no dedicated technician role yet, so any user can be assigned.
        </p>

        <Select
          id="assign-technician"
          label="Technician"
          placeholder="Select a user"
          value={technicianUserId}
          onChange={(event) => {
            setTechnicianUserId(event.target.value);
            setError(null);
          }}
          options={technicians.map((person) => ({
            value: person.id,
            label: `${person.full_name} (${humanize(person.role)})`,
          }))}
        />

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Assign
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TechnicianAssignModal;
