import React from "react";
import { useForm } from "react-hook-form";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export const LoginForm = ({ onSubmit, submitLoading, error, onForgotPassword }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-[rgba(224,100,90,0.08)] border border-[rgba(224,100,90,0.2)] text-danger rounded-default text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Email input field */}
      <Input
        label="Email"
        id="login-email"
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

      {/* Password input field */}
      <div className="space-y-1">
        <Input
          label="Password"
          id="login-password"
          type="password"
          placeholder="••••••••••••"
          error={errors.password?.message}
          {...register("password", { required: "Password is required" })}
        />
        <div className="text-right">
          <span
            onClick={onForgotPassword}
            className="text-xs text-text-muted hover:text-text-primary cursor-pointer transition-colors select-none"
          >
            Forgot password
          </span>
        </div>
      </div>

      {/* Sign In Button */}
      <Button
        type="submit"
        loading={submitLoading}
        className="w-full font-bold uppercase tracking-wider text-xs py-2.5 mt-2"
      >
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;
