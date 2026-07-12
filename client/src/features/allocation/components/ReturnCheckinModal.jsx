import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import { useAuth } from "../../../hooks/useAuth";
import { cleanPayload } from "../../../utils/validators";
import { ASSET_CONDITIONS } from "../../../constants/assetStatuses";
import { humanize } from "../../../utils/assetStatus";

export const ReturnCheckinModal = ({
  isOpen,
  onClose,
  asset,
  onSubmit,
  submitting = false,
  submitError = null,
}) => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { checkinCondition: "", checkinNotes: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ checkinCondition: "", checkinNotes: "" });
    }
  }, [isOpen, reset]);

  const submit = (values) => {
    const payload = cleanPayload({
      checkinCondition: values.checkinCondition,
      checkinNotes: values.checkinNotes,
      returnReceivedBy: user?.id,
    });
    onSubmit?.(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Return asset" size="md">
      <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
        {asset && (
          <p className="text-sm text-text-secondary">
            Checking in{" "}
            <span className="font-mono text-[13px] text-text-primary">
              {asset.asset_tag || "Untagged"}
            </span>{" "}
            {asset.name}. Record its condition on arrival.
          </p>
        )}

        <Select
          id="return-checkin-condition"
          label="Check-in condition"
          placeholder="Select the condition"
          defaultValue=""
          options={ASSET_CONDITIONS.map((condition) => ({
            value: condition,
            label: humanize(condition),
          }))}
          error={errors.checkinCondition?.message}
          {...register("checkinCondition", {
            required: "Select the condition of the returned asset",
          })}
        />

        <Textarea
          id="return-checkin-notes"
          label="Check-in notes (optional)"
          placeholder="Scratches, missing accessories, anything worth noting"
          maxLength={2000}
          error={errors.checkinNotes?.message}
          {...register("checkinNotes", {
            maxLength: { value: 2000, message: "Notes must be 2000 characters or fewer" },
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
            Confirm return
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReturnCheckinModal;
