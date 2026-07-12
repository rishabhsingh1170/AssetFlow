import React from "react";
import { useForm } from "react-hook-form";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export const SignupForm = ({ onSubmit, submitLoading, error, success }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { fullName: "", email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="px-3 py-2.5 bg-danger-bg border border-danger-border text-danger rounded-default text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="px-3 py-2.5 bg-success-bg border border-success-border text-success rounded-default text-sm">
          {success}
        </div>
      )}

      <Input
        label="Full name"
        id="signup-fullname"
        placeholder="John Doe"
        error={errors.fullName?.message}
        {...register("fullName", { required: "Full name is required" })}
      />

      <Input
        label="Email"
        id="signup-email"
        placeholder="name@company.com"
        error={errors.email?.message}
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        })}
      />

      <Input
        label="Password"
        id="signup-password"
        type="password"
        placeholder="At least 8 characters"
        error={errors.password?.message}
        {...register("password", {
          required: "Password is required",
          minLength: { value: 8, message: "Password must be at least 8 characters" },
        })}
      />

      <Button type="submit" loading={submitLoading} className="w-full mt-2">
        Create account
      </Button>
    </form>
  );
};

export default SignupForm;
