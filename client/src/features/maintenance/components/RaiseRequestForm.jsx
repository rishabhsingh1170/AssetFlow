import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../../hooks/useAuth";
import { MAINTENANCE_PRIORITIES } from "../../../constants/assetStatuses";
import { humanize } from "../../../utils/assetStatus";
import { addMaintenanceRequest, clearSubmitError } from "../maintenance.slice";

const PRIORITY_OPTIONS = MAINTENANCE_PRIORITIES.map((value) => ({
  value,
  label: humanize(value),
}));

export const RaiseRequestForm = ({ isOpen, onClose, defaultAssetId = "" }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useAuth();
  const { assetOptions = [], submitLoading, submitError } = useSelector(
    (state) => state.maintenance || {}
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      assetId: defaultAssetId,
      issueDescription: "",
      priority: "medium",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        assetId: defaultAssetId || "",
        issueDescription: "",
        priority: "medium",
      });
      dispatch(clearSubmitError());
    }
  }, [isOpen, defaultAssetId, reset, dispatch]);

  const onSubmit = async (values) => {
    try {
      await dispatch(
        addMaintenanceRequest({
          assetId: values.assetId,
          issueDescription: values.issueDescription,
          priority: values.priority,
          requestedBy: user?.id,
        })
      ).unwrap();
      toast({
        title: "Request raised",
        description: "Your maintenance request is pending review.",
        variant: "success",
      });
      onClose?.();
    } catch (err) {
      // submitError in the slice renders the inline banner below.
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Raise maintenance request">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {submitError && (
          <div className="bg-danger-bg border border-danger-border text-danger text-sm rounded-default px-3 py-2">
            {submitError}
          </div>
        )}

        <Select
          id="maintenance-asset"
          label="Asset"
          placeholder="Select an asset"
          defaultValue={defaultAssetId || ""}
          options={assetOptions.map((asset) => ({
            value: asset.id,
            label: `${asset.asset_tag ? `${asset.asset_tag} ` : ""}${asset.name}`,
          }))}
          error={errors.assetId?.message}
          {...register("assetId", { required: "Asset is required" })}
        />

        <Textarea
          id="maintenance-issue"
          label="Issue description"
          placeholder="Describe the problem with this asset"
          maxLength={2000}
          error={errors.issueDescription?.message}
          {...register("issueDescription", {
            required: "Issue description is required",
            minLength: {
              value: 5,
              message: "Description must be at least 5 characters",
            },
            maxLength: {
              value: 2000,
              message: "Description must be 2000 characters or fewer",
            },
          })}
        />

        <Select
          id="maintenance-priority"
          label="Priority"
          options={PRIORITY_OPTIONS}
          error={errors.priority?.message}
          {...register("priority")}
        />

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={submitLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={submitLoading}>
            Raise request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RaiseRequestForm;
