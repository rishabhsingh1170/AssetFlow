import React from "react";
import { useForm } from "react-hook-form";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export const CategoryForm = ({
  defaultValues = { name: "", code: "", description: "" },
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
      code: defaultValues.code || "",
      description: defaultValues.description || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* API submit error banner */}
      {submitError && (
        <div className="px-3 py-2.5 bg-danger-bg border border-danger-border text-danger rounded-default text-sm">
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

      {/* Code Input (Required by Backend) */}
      <Input
        label="Category Code"
        id="cat-code"
        placeholder="e.g. ELEC, FURN"
        error={errors.code?.message}
        {...register("code", {
          required: "Category Code is required",
          minLength: { value: 2, message: "Code must be at least 2 characters" },
          maxLength: { value: 40, message: "Code must not exceed 40 characters" },
        })}
      />

      {/* Description Input */}
      <div className="flex flex-col space-y-1 text-left">
        <label htmlFor="cat-desc" className="text-xs text-text-secondary select-none">
          Description
        </label>
        <textarea
          id="cat-desc"
          placeholder="Category description..."
          className="bg-surface-2 border border-border focus:border-border-strong rounded-default text-text-primary p-3 text-xs w-full min-h-[80px] outline-none transition-colors placeholder:text-text-muted"
          {...register("description")}
        />
      </div>

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
