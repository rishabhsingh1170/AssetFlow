import React from "react";
import { useForm } from "react-hook-form";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export const SignupForm = ({ onSubmit, submitLoading, error }) => {
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
        <div className="p-3 bg-[rgba(224,100,90,0.08)] border border-[rgba(224,100,90,0.2)] text-danger rounded-default text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Full Name field */}
      <Input
        label="Full Name"
        id="signup-fullname"
        placeholder="John Doe"
        error={errors.fullName?.message}
        {...register("fullName", { required: "Full Name is required" })}
      />

      {/* Email field */}
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

      {/* Password field */}
      <Input
        label="Password"
        id="signup-password"
        type="password"
        placeholder="••••••••••••"
        error={errors.password?.message}
        {...register("password", {
          required: "Password is required",
          minLength: { value: 6, message: "Password must be at least 6 characters" },
        })}
      />

      {/* Note about employee account and admin assignment */}
      <div className="bg-surface-2 border border-border rounded-default p-3 text-[11px] text-text-secondary leading-relaxed select-none">
        <span className="font-semibold text-text-primary uppercase tracking-wider block mb-1">
          New here?
        </span>
        Sign up creates an employee account <br />
        admin roles assigned later
      </div>

      {/* Create Account Button */}
      <Button
        type="submit"
        loading={submitLoading}
        className="w-full font-bold uppercase tracking-wider text-xs py-2.5 mt-2"
      >
        Create Account
      </Button>
    </form>
  );
};

export default SignupForm;
