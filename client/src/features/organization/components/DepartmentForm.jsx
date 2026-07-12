import React from "react";
import { useForm } from "react-hook-form";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";

export const DepartmentForm = ({
  defaultValues = { name: "", headId: "", parentDepartmentId: "", status: "Active" },
  onSubmit,
  employees = [],
  departments = [],
  editingDeptId = null,
  submitLoading = false,
  submitError = null,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: defaultValues.name || "",
      headId: defaultValues.headId ? String(defaultValues.headId) : "",
      parentDepartmentId: defaultValues.parentDepartmentId ? String(defaultValues.parentDepartmentId) : "",
      status: defaultValues.status || "Active",
    },
  });

  // Filter out the department currently being edited to prevent self-parenting loops
  const parentOptions = departments
    .filter((dept) => !editingDeptId || dept.id !== editingDeptId)
    .map((dept) => ({ label: dept.name, value: String(dept.id) }));

  const employeeOptions = employees.map((emp) => ({
    label: `${emp.name} (${emp.email})`,
    value: String(emp.id),
  }));

  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Inline API submission error banner */}
      {submitError && (
        <div className="p-3 bg-[rgba(224,100,90,0.08)] border border-[rgba(224,100,90,0.2)] text-danger rounded-default text-xs font-semibold">
          {submitError}
        </div>
      )}

      {/* Name Input */}
      <Input
        label="Department Name"
        id="dept-name"
        placeholder="e.g. Engineering"
        error={errors.name?.message}
        {...register("name", { required: "Department Name is required" })}
      />

      {/* Department Head Selector */}
      <Select
        label="Department Head"
        id="dept-head"
        placeholder="Select Department Head (Optional)"
        options={employeeOptions}
        error={errors.headId?.message}
        {...register("headId")}
      />

      {/* Parent Department Selector */}
      <Select
        label="Parent Department"
        id="parent-dept"
        placeholder="Select Parent Department (Optional)"
        options={parentOptions}
        error={errors.parentDepartmentId?.message}
        {...register("parentDepartmentId")}
      />

      {/* Status Toggle Selector */}
      <Select
        label="Status"
        id="dept-status"
        options={statusOptions}
        error={errors.status?.message}
        {...register("status")}
      />

      {/* Footer Submit Buttons */}
      <div className="flex justify-end pt-4 border-t border-border mt-6">
        <Button
          type="submit"
          loading={submitLoading}
          className="px-6 py-2.5 font-bold uppercase tracking-wider text-xs"
        >
          Save Department
        </Button>
      </div>
    </form>
  );
};

export default DepartmentForm;
