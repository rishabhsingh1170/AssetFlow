import React, { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../../../api/axios";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { useToast } from "../../../components/ui/Toast";
import { cleanPayload } from "../../../utils/validators";

// Mirrors server/validations/audit.validation.js createAuditCycle:
// name required 2-160, scopeDepartmentId/scopeLocationId optional uuids,
// startsOn/endsOn required dates with endsOn >= startsOn, auditorUserIds
// array (the UI requires at least one auditor).
// BACKEND GAP: no /api/audit/cycles route is mounted yet; this form is only
// reachable when AUDIT_CYCLES_ENABLED is flipped in AuditPage.jsx.
export const AuditCycleForm = ({
  isOpen,
  onClose,
  departments = [],
  locations = [],
  users = [],
  onCreated,
}) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      scopeDepartmentId: "",
      scopeLocationId: "",
      startsOn: "",
      endsOn: "",
      auditorUserIds: [],
    },
  });

  const handleClose = () => {
    reset();
    setSubmitError(null);
    onClose?.();
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.post("/audit/cycles", cleanPayload(values));
      toast({
        title: "Audit cycle created",
        description: `"${values.name}" is ready for scheduling.`,
        variant: "success",
      });
      onCreated?.(res.data);
      handleClose();
    } catch (err) {
      setSubmitError(
        err.errors?.[0]?.message || err.message || "Failed to create audit cycle"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New audit cycle" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {submitError && (
          <div className="rounded-default border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        )}

        <Input
          id="audit-cycle-name"
          label="Cycle name"
          placeholder="Q3 laptop verification"
          error={errors.name?.message}
          {...register("name", {
            required: "Cycle name is required",
            minLength: { value: 2, message: "Must be at least 2 characters" },
            maxLength: { value: 160, message: "Must be at most 160 characters" },
          })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="audit-cycle-department"
            label="Scope department (optional)"
            options={[
              { value: "", label: "All departments" },
              ...departments.map((d) => ({ value: d.id, label: d.name })),
            ]}
            error={errors.scopeDepartmentId?.message}
            {...register("scopeDepartmentId")}
          />
          <Select
            id="audit-cycle-location"
            label="Scope location (optional)"
            options={[
              { value: "", label: "All locations" },
              ...locations.map((l) => ({ value: l.id, label: l.name })),
            ]}
            error={errors.scopeLocationId?.message}
            {...register("scopeLocationId")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="audit-cycle-starts"
            label="Starts on"
            type="date"
            error={errors.startsOn?.message}
            {...register("startsOn", { required: "Start date is required" })}
          />
          <Input
            id="audit-cycle-ends"
            label="Ends on"
            type="date"
            error={errors.endsOn?.message}
            {...register("endsOn", {
              required: "End date is required",
              validate: (value) => {
                const start = getValues("startsOn");
                if (!start || !value) return true;
                return (
                  new Date(value) >= new Date(start) ||
                  "End date must be on or after start date"
                );
              },
            })}
          />
        </div>

        <div>
          <p className="eyebrow mb-1.5">Auditors</p>
          <div className="max-h-44 overflow-y-auto rounded-default border border-border-strong divide-y divide-border">
            {users.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-text-muted">
                No users available to assign.
              </p>
            ) : (
              users.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-primary cursor-pointer hover:bg-surface-2 transition-colors"
                >
                  <input
                    type="checkbox"
                    value={u.id}
                    className="accent-accent-500"
                    {...register("auditorUserIds", {
                      validate: (value) =>
                        (Array.isArray(value) && value.length > 0) ||
                        "Select at least one auditor",
                    })}
                  />
                  <span>{u.full_name || u.email}</span>
                  {u.role && (
                    <span className="font-mono text-[11px] text-text-muted uppercase tracking-[0.06em]">
                      {u.role}
                    </span>
                  )}
                </label>
              ))
            )}
          </div>
          {errors.auditorUserIds && (
            <p className="mt-1.5 text-xs text-danger font-medium">
              {errors.auditorUserIds.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create cycle
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AuditCycleForm;
