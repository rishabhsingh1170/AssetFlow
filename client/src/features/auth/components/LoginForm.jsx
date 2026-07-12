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
        <div className="px-3 py-2.5 bg-danger-bg border border-danger-border text-danger rounded-default text-sm">
          {error}
        </div>
      )}

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

      <div className="space-y-1.5">
        <Input
          label="Password"
          id="login-password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password", { required: "Password is required" })}
        />
        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-accent-600 hover:text-accent-800 cursor-pointer font-medium transition-colors"
          >
            Forgot password
          </button>
        </div>
      </div>

      <Button type="submit" loading={submitLoading} className="w-full mt-2">
        Sign in
      </Button>
    </form>
  );
};

export default LoginForm;
