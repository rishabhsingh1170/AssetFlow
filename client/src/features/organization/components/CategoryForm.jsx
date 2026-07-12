import React from "react";
import { useForm } from "react-hook-form";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export const CategoryForm = ({
  defaultValues = { name: "" },
  onSubmit,
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
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* API submit error banner */}
      {submitError && (
        <div className="p-3 bg-[rgba(224,100,90,0.08)] border border-[rgba(224,100,90,0.2)] text-danger rounded-default text-xs font-semibold">
          {submitError}
        </div>
      )}

      {/* Name Input */}
      <Input
        label="Category Name"
        id="cat-name"
        placeholder="e.g. Electronics, Furniture"
        error={errors.name?.message}
        {...register("name", { required: "Category Name is required" })}
      />

      {/* Footer Submit Buttons */}
      <div className="flex justify-end pt-4 border-t border-border mt-6">
        <Button
          type="submit"
          loading={submitLoading}
          className="px-6 py-2.5 font-bold uppercase tracking-wider text-xs"
        >
          Save Category
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
