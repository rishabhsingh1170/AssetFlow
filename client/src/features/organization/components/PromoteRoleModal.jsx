import React, { useState, useEffect } from "react";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";

export const PromoteRoleModal = ({
  employee,
  onSubmit,
  onClose,
  submitLoading = false,
  submitError = null,
}) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [success, setSuccess] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Initialize selected role with current role when employee changes
  useEffect(() => {
    if (employee) {
      setSelectedRole(employee.role);
      setSuccess(false);
      setLocalError(null);
    }
  }, [employee]);

  if (!employee) return null;

  const roleOptions = [
    { label: "Admin", value: "admin" },
    { label: "Asset Manager", value: "asset_manager" },
    { label: "Department Head", value: "department_head" },
    { label: "Employee", value: "employee" },
  ];

  const getRoleLabel = (role) => {
    return roleOptions.find((opt) => opt.value === role)?.label || role;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError(null);
    try {
      await onSubmit(selectedRole);
      setSuccess(true);
    } catch (err) {
      setLocalError(err.message || "Failed to promote employee");
    } finally {
      setLocalLoading(false);
    }
  };

  const showConfirmationMessage = selectedRole !== employee.role;
  const activeError = localError || submitError;
  const activeLoading = localLoading || submitLoading;

  if (success) {
    return (
      <div className="space-y-6 text-center py-4 select-none">
        <div className="w-12 h-12 rounded-full bg-success-bg border border-success-border text-success flex items-center justify-center mx-auto text-lg font-bold">
          ✓
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Promotion Complete
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
            <span className="font-semibold text-text-primary">{employee.name}</span> has been promoted to the role of <span className="font-bold text-accent-800">{getRoleLabel(selectedRole)}</span>. They'll see their updated access next time they log in.
          </p>
        </div>
        <div className="pt-4 border-t border-border mt-6 flex justify-center">
          <Button
            onClick={onClose}
            className="px-6 font-bold uppercase tracking-wider text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* API Submission Error */}
      {activeError && (
        <div className="px-3 py-2.5 bg-danger-bg border border-danger-border text-danger rounded-default text-sm">
          {activeError}
        </div>
      )}

      {/* Target User Details Card */}
      <div className="bg-surface-2 border border-border p-4 rounded-default">
        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
          User Details
        </h4>
        <div className="text-sm font-semibold text-text-primary mb-0.5">
          {employee.name}
        </div>
        <div className="text-xs text-text-muted font-mono">{employee.email}</div>
        <div className="mt-2 text-xs text-text-secondary">
          Current Role: <span className="font-semibold text-text-primary capitalize">{employee.role.replace("_", " ")}</span>
        </div>
      </div>

      {/* Role Selector */}
      <Select
        label="Select New Role"
        id="promote-role"
        options={roleOptions}
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
      />

      {/* Deliberate Confirmation Notice */}
      {showConfirmationMessage && (
        <div className="bg-warning-bg border border-warning-border p-4 rounded-default text-xs text-warning">
          <p className="font-semibold mb-1">Deliberate Action Required:</p>
          <p className="leading-relaxed">
            Are you sure you want to promote <span className="font-semibold text-text-primary">{employee.name}</span> to the role of <span className="font-bold text-accent-800">{getRoleLabel(selectedRole)}</span>? They will see their updated access next time they log in.
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={activeLoading}
          className="font-bold uppercase tracking-wider text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={activeLoading}
          disabled={!showConfirmationMessage}
          className="px-6 font-bold uppercase tracking-wider text-xs"
        >
          Confirm Role Change
        </Button>
      </div>
    </form>
  );
};

export default PromoteRoleModal;
