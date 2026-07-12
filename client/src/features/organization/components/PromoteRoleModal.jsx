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

  // Initialize selected role with current role when employee changes
  useEffect(() => {
    if (employee) {
      setSelectedRole(employee.role);
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedRole);
  };

  const showConfirmationMessage = selectedRole !== employee.role;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* API Submission Error */}
      {submitError && (
        <div className="px-3 py-2.5 bg-danger-bg border border-danger-border text-danger rounded-default text-sm">
          {submitError}
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
            Are you sure you want to promote <span className="font-semibold text-text-primary">{employee.name}</span> to the role of <span className="font-bold text-accent-800">{getRoleLabel(selectedRole)}</span>? This will modify their access privileges immediately.
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={submitLoading}
          className="font-bold uppercase tracking-wider text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={submitLoading}
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
