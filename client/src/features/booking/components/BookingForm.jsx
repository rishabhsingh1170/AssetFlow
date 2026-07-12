import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import { useAuth } from "../../../hooks/useAuth";
import { cleanPayload, endAfterStart } from "../../../utils/validators";
import { fromDatetimeLocal, toDatetimeLocal } from "../../../utils/formatDate";
import ConflictWarning from "./ConflictWarning";

// Default the end one hour after a pre-filled start (slot clicks pass 09:00).
const plusOneHour = (datetimeLocal) => {
  if (!datetimeLocal) return "";
  const date = new Date(datetimeLocal);
  if (Number.isNaN(date.getTime())) return "";
  date.setHours(date.getHours() + 1);
  return toDatetimeLocal(date.toISOString());
};

export const BookingForm = ({
  isOpen,
  onClose,
  assets = [],
  bookings = [],
  defaultAssetId = "",
  defaultStartsAt = "",
  onSubmit,
  submitting = false,
  submitError = null,
}) => {
  const { user, profile } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      assetId: defaultAssetId || "",
      startsAt: defaultStartsAt || "",
      endsAt: plusOneHour(defaultStartsAt),
      purpose: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        assetId: defaultAssetId || "",
        startsAt: defaultStartsAt || "",
        endsAt: plusOneHour(defaultStartsAt),
        purpose: "",
      });
    }
  }, [isOpen, defaultAssetId, defaultStartsAt, reset]);

  const watchedAssetId = watch("assetId");
  const watchedStartsAt = watch("startsAt");
  const watchedEndsAt = watch("endsAt");

  const submit = (values) => {
    const payload = cleanPayload({
      assetId: values.assetId,
      startsAt: fromDatetimeLocal(values.startsAt),
      endsAt: fromDatetimeLocal(values.endsAt),
      purpose: values.purpose,
      // The server requires bookedBy (no auth middleware on this route).
      bookedBy: user?.id,
      departmentId: profile?.department_id,
    });
    onSubmit?.(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New booking" size="lg">
      <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
        <Select
          id="booking-asset"
          label="Resource"
          placeholder="Select a shared resource"
          defaultValue=""
          options={assets.map((asset) => ({
            value: asset.id,
            label: `${asset.asset_tag || "Untagged"} - ${asset.name}`,
          }))}
          error={errors.assetId?.message}
          {...register("assetId", { required: "Select a resource to book" })}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="booking-starts-at"
            label="Starts"
            type="datetime-local"
            error={errors.startsAt?.message}
            {...register("startsAt", { required: "Start time is required" })}
          />
          <Input
            id="booking-ends-at"
            label="Ends"
            type="datetime-local"
            error={errors.endsAt?.message}
            {...register("endsAt", {
              required: "End time is required",
              validate: endAfterStart(() => watch("startsAt")),
            })}
          />
        </div>

        <Textarea
          id="booking-purpose"
          label="Purpose (optional)"
          placeholder="What is this booking for?"
          maxLength={500}
          error={errors.purpose?.message}
          {...register("purpose", {
            maxLength: { value: 500, message: "Purpose must be 500 characters or fewer" },
          })}
        />

        <ConflictWarning
          assetId={watchedAssetId}
          startsAt={watchedStartsAt}
          endsAt={watchedEndsAt}
          bookings={bookings}
          submitError={submitError}
        />

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create booking
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BookingForm;
