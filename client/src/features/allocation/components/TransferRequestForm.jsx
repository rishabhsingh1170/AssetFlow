import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import { useAuth } from "../../../hooks/useAuth";
import { useRole } from "../../../hooks/useRole";
import { cleanPayload } from "../../../utils/validators";
import { HOLDER_TYPES } from "../../../constants/assetStatuses";
import { humanize } from "../../../utils/assetStatus";

export const TransferRequestForm = ({
  isOpen,
  onClose,
  assets = [],
  users = [],
  departments = [],
  usersUnavailable = false,
  initialAssetId = "",
  onSubmit,
  submitting = false,
  submitError = null,
}) => {
  const { user, profile } = useAuth();
  const { isEmployee } = useRole();

  // Transfers move custody, so only currently allocated assets qualify.
  const allocatedAssets = assets.filter((asset) => asset.status === "allocated");

  // Employees cannot list users (401/403 on GET /api/users), so their
  // transfer requests target themselves.
  const lockToSelf = usersUnavailable && isEmployee;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      assetId: initialAssetId || "",
      targetHolderType: "employee",
      targetUserId: "",
      targetDepartmentId: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        assetId: initialAssetId || "",
        targetHolderType: "employee",
        targetUserId: "",
        targetDepartmentId: "",
        reason: "",
      });
    }
  }, [isOpen, initialAssetId, reset]);

  const targetHolderType = watch("targetHolderType");

  const submit = (values) => {
    const payload = cleanPayload({
      targetHolderType: values.targetHolderType,
      targetUserId:
        values.targetHolderType === "employee"
          ? lockToSelf
            ? user?.id
            : values.targetUserId
          : undefined,
      targetDepartmentId:
        values.targetHolderType === "department"
          ? values.targetDepartmentId
          : undefined,
      reason: values.reason,
      // The server 400s without requestedBy (no auth middleware on this route).
      requestedBy: user?.id,
    });
    onSubmit?.(values.assetId, payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request transfer" size="lg">
      <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
        <div className="flex items-start gap-2.5 rounded-default border border-info-border bg-info-bg px-3 py-2.5">
          <Info size={16} className="text-info mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-info">
            Transfer requests are recorded with status requested. The review
            flow is not available yet.
          </p>
        </div>

        <Select
          id="transfer-asset"
          label="Asset"
          placeholder="Select an allocated asset"
          defaultValue=""
          options={allocatedAssets.map((asset) => ({
            value: asset.id,
            label: `${asset.asset_tag || "Untagged"} - ${asset.name}`,
          }))}
          error={errors.assetId?.message}
          {...register("assetId", { required: "Select an asset to transfer" })}
        />

        <fieldset>
          <legend className="eyebrow block mb-1.5">Target holder type</legend>
          <div className="flex items-center gap-5">
            {HOLDER_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 text-sm text-text-primary cursor-pointer"
              >
                <input
                  type="radio"
                  value={type}
                  className="accent-accent-500 cursor-pointer"
                  disabled={lockToSelf && type === "department"}
                  {...register("targetHolderType")}
                />
                {humanize(type)}
              </label>
            ))}
          </div>
        </fieldset>

        {targetHolderType === "employee" &&
          (lockToSelf ? (
            <Input
              id="transfer-target-self"
              label="Transfer to me"
              value={profile?.full_name || user?.email || "Me"}
              disabled
              readOnly
            />
          ) : (
            <Select
              id="transfer-target-user"
              label="Target employee"
              placeholder="Select an employee"
              defaultValue=""
              options={users.map((u) => ({
                value: u.id,
                label: u.full_name || u.email,
              }))}
              error={errors.targetUserId?.message}
              {...register("targetUserId", {
                validate: (value) =>
                  watch("targetHolderType") !== "employee" ||
                  Boolean(value) ||
                  "Select the employee receiving the asset",
              })}
            />
          ))}

        {targetHolderType === "department" && (
          <Select
            id="transfer-target-department"
            label="Target department"
            placeholder="Select a department"
            defaultValue=""
            options={departments.map((dept) => ({
              value: dept.id,
              label: dept.name,
            }))}
            error={errors.targetDepartmentId?.message}
            {...register("targetDepartmentId", {
              validate: (value) =>
                watch("targetHolderType") !== "department" ||
                Boolean(value) ||
                "Select the department receiving the asset",
            })}
          />
        )}

        <Textarea
          id="transfer-reason"
          label="Reason (optional)"
          placeholder="Why should this asset change hands?"
          maxLength={1000}
          error={errors.reason?.message}
          {...register("reason", {
            maxLength: { value: 1000, message: "Reason must be 1000 characters or fewer" },
          })}
        />

        {submitError && (
          <div className="rounded-default border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger">
            {submitError.message || String(submitError)}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Submit request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransferRequestForm;
