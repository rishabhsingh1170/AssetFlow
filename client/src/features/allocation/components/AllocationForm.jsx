import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { useAuth } from "../../../hooks/useAuth";
import { useRole } from "../../../hooks/useRole";
import { cleanPayload, isFutureDate } from "../../../utils/validators";
import { fromDatetimeLocal } from "../../../utils/formatDate";
import { HOLDER_TYPES } from "../../../constants/assetStatuses";
import { humanize } from "../../../utils/assetStatus";

export const AllocationForm = ({
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

  // Only assets that can actually be allocated are offered.
  const availableAssets = assets.filter((asset) => asset.status === "available");

  // When GET /api/users is not accessible (employee role gets 401/403), the
  // holder is locked to the signed-in user instead of hiding the feature.
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
      holderType: "employee",
      holderUserId: "",
      holderDepartmentId: "",
      expectedReturnAt: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        assetId: initialAssetId || "",
        holderType: "employee",
        holderUserId: "",
        holderDepartmentId: "",
        expectedReturnAt: "",
      });
    }
  }, [isOpen, initialAssetId, reset]);

  const holderType = watch("holderType");

  const submit = (values) => {
    const payload = cleanPayload({
      holderType: values.holderType,
      holderUserId:
        values.holderType === "employee"
          ? lockToSelf
            ? user?.id
            : values.holderUserId
          : undefined,
      holderDepartmentId:
        values.holderType === "department" ? values.holderDepartmentId : undefined,
      expectedReturnAt: fromDatetimeLocal(values.expectedReturnAt),
      allocatedBy: user?.id,
    });
    onSubmit?.(values.assetId, payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Allocate asset" size="lg">
      <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
        <Select
          id="allocation-asset"
          label="Asset"
          placeholder="Select an available asset"
          defaultValue=""
          options={availableAssets.map((asset) => ({
            value: asset.id,
            label: `${asset.asset_tag || "Untagged"} - ${asset.name}`,
          }))}
          error={errors.assetId?.message}
          {...register("assetId", { required: "Select an asset to allocate" })}
        />

        <fieldset>
          <legend className="eyebrow block mb-1.5">Holder type</legend>
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
                  {...register("holderType")}
                />
                {humanize(type)}
              </label>
            ))}
          </div>
        </fieldset>

        {holderType === "employee" &&
          (lockToSelf ? (
            <Input
              id="allocation-holder-self"
              label="Assign to me"
              value={profile?.full_name || user?.email || "Me"}
              disabled
              readOnly
            />
          ) : (
            <Select
              id="allocation-holder-user"
              label="Holder"
              placeholder="Select an employee"
              defaultValue=""
              options={users.map((u) => ({
                value: u.id,
                label: u.full_name || u.email,
              }))}
              error={errors.holderUserId?.message}
              {...register("holderUserId", {
                validate: (value) =>
                  watch("holderType") !== "employee" ||
                  Boolean(value) ||
                  "Select the employee receiving the asset",
              })}
            />
          ))}

        {holderType === "department" && (
          <Select
            id="allocation-holder-department"
            label="Holder department"
            placeholder="Select a department"
            defaultValue=""
            options={departments.map((dept) => ({
              value: dept.id,
              label: dept.name,
            }))}
            error={errors.holderDepartmentId?.message}
            {...register("holderDepartmentId", {
              validate: (value) =>
                watch("holderType") !== "department" ||
                Boolean(value) ||
                "Select the department receiving the asset",
            })}
          />
        )}

        <Input
          id="allocation-expected-return"
          label="Expected return (optional)"
          type="datetime-local"
          error={errors.expectedReturnAt?.message}
          {...register("expectedReturnAt", { validate: isFutureDate })}
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
            Allocate asset
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AllocationForm;
