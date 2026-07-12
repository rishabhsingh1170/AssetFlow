import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import Button from "../../../components/ui/Button";
import {
  ASSET_STATUSES,
  ASSET_CONDITIONS,
} from "../../../constants/assetStatuses";
import { humanize } from "../../../utils/assetStatus";
import { cleanPayload } from "../../../utils/validators";

const toEnumOptions = (values) =>
  values.map((value) => ({ value, label: humanize(value) }));

const toLookupOptions = (rows, noneLabel) => [
  { value: "", label: noneLabel },
  ...rows.map((row) => ({ value: row.id, label: row.name })),
];

const defaultsFromAsset = (asset) => ({
  name: asset?.name || "",
  categoryId: asset?.category_id || "",
  serialNumber: asset?.serial_number || "",
  acquisitionDate: asset?.acquisition_date
    ? String(asset.acquisition_date).slice(0, 10)
    : "",
  acquisitionCost:
    asset?.acquisition_cost === null || asset?.acquisition_cost === undefined
      ? ""
      : asset.acquisition_cost,
  condition: asset?.condition || "good",
  status: asset?.status || "available",
  locationId: asset?.location_id || "",
  owningDepartmentId: asset?.owning_department_id || "",
  isSharedBookable: Boolean(asset?.is_shared_bookable),
  notes: asset?.notes || "",
});

// Mirrors server/validations/asset.validation.js (createAsset / updateAsset).
export const AssetRegisterForm = ({
  asset = null,
  categories = [],
  departments = [],
  locations = [],
  submitLoading = false,
  submitError = null,
  onSubmit,
  onCancel,
}) => {
  const isEdit = Boolean(asset?.id);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultsFromAsset(asset) });

  useEffect(() => {
    reset(defaultsFromAsset(asset));
  }, [asset, reset]);

  const watchedStatus = watch("status");
  const showLifecycleHint =
    isEdit &&
    (watchedStatus === "retired" || watchedStatus === "disposed") &&
    asset?.status !== watchedStatus;

  const submit = (values) => {
    const payload = { ...values };

    // valueAsNumber turns an empty cost field into NaN; omit it entirely.
    if (
      payload.acquisitionCost === "" ||
      Number.isNaN(payload.acquisitionCost)
    ) {
      delete payload.acquisitionCost;
    }

    if (!isEdit) {
      // Status is server-controlled on create (new assets start available).
      delete payload.status;
    }

    const cleaned = cleanPayload(payload);
    // cleanPayload keeps booleans, but be explicit so an unchecked box still
    // reaches the server as false on edit.
    cleaned.isSharedBookable = Boolean(values.isSharedBookable);

    // DB check constraints require lifecycle timestamps when the status
    // moves to retired or disposed.
    if (isEdit && values.status === "retired" && asset?.status !== "retired") {
      cleaned.retiredAt = new Date().toISOString();
    }
    if (
      isEdit &&
      values.status === "disposed" &&
      asset?.status !== "disposed"
    ) {
      cleaned.disposedAt = new Date().toISOString();
    }

    onSubmit?.(cleaned);
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      {submitError && (
        <div
          role="alert"
          className="bg-danger-bg border border-danger-border text-danger rounded-default px-3 py-2.5 text-sm"
        >
          {submitError}
        </div>
      )}

      <Input
        id="asset-name"
        label="Asset name"
        placeholder="e.g. Dell Latitude 5440"
        error={errors.name?.message}
        {...register("name", {
          required: "Asset name is required",
          minLength: {
            value: 2,
            message: "Asset name must be at least 2 characters",
          },
          maxLength: {
            value: 160,
            message: "Asset name must be at most 160 characters",
          },
        })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="asset-category"
          label="Category"
          placeholder="Select a category"
          options={categories.map((row) => ({
            value: row.id,
            label: row.name,
          }))}
          error={errors.categoryId?.message}
          {...register("categoryId", { required: "Category is required" })}
        />
        <Input
          id="asset-serial"
          label="Serial number"
          placeholder="Optional"
          error={errors.serialNumber?.message}
          {...register("serialNumber", {
            maxLength: {
              value: 120,
              message: "Serial number must be at most 120 characters",
            },
          })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="asset-acquisition-date"
          label="Acquisition date"
          type="date"
          error={errors.acquisitionDate?.message}
          {...register("acquisitionDate")}
        />
        <Input
          id="asset-acquisition-cost"
          label="Acquisition cost (INR)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          error={errors.acquisitionCost?.message}
          {...register("acquisitionCost", {
            valueAsNumber: true,
            validate: (value) =>
              value === undefined ||
              Number.isNaN(value) ||
              value >= 0 ||
              "Cost must be zero or more",
          })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="asset-condition"
          label="Condition"
          options={toEnumOptions(ASSET_CONDITIONS)}
          error={errors.condition?.message}
          {...register("condition")}
        />
        {isEdit && (
          <Select
            id="asset-status"
            label="Status"
            options={toEnumOptions(ASSET_STATUSES)}
            error={errors.status?.message}
            {...register("status")}
          />
        )}
      </div>

      {showLifecycleHint && (
        <p className="text-xs text-warning bg-warning-bg border border-warning-border rounded-default px-3 py-2">
          Setting this status stamps a permanent {humanize(watchedStatus)}{" "}
          timestamp on the record.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="asset-location"
          label="Location"
          options={toLookupOptions(locations, "No location")}
          error={errors.locationId?.message}
          {...register("locationId")}
        />
        <Select
          id="asset-department"
          label="Owning department"
          options={toLookupOptions(departments, "No department")}
          error={errors.owningDepartmentId?.message}
          {...register("owningDepartmentId")}
        />
      </div>

      <label className="flex items-start gap-3 p-3 border border-border-strong rounded-default cursor-pointer hover:bg-surface-2 transition-colors">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-accent-500 cursor-pointer"
          {...register("isSharedBookable")}
        />
        <span>
          <span className="block text-sm font-medium text-text-primary">
            Shared bookable resource
          </span>
          <span className="block text-xs text-text-secondary mt-0.5">
            Allow this asset to be reserved through resource booking.
          </span>
        </span>
      </label>

      <Textarea
        id="asset-notes"
        label="Notes"
        placeholder="Optional context, warranty details, or handling notes"
        error={errors.notes?.message}
        {...register("notes", {
          maxLength: {
            value: 2000,
            message: "Notes must be at most 2000 characters",
          },
        })}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={submitLoading}>
          Cancel
        </Button>
        <Button type="submit" loading={submitLoading}>
          {isEdit ? "Save changes" : "Register asset"}
        </Button>
      </div>
    </form>
  );
};

export default AssetRegisterForm;
