import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Logo from "../../../components/brand/Logo";
import { authService } from "../services/auth.service";
import { clearError, loginFailure } from "../auth.slice";

const MODE_COPY = {
  login: {
    title: "Sign in",
    helper: "Use your work email to access the asset workspace.",
  },
  signup: {
    title: "Create your account",
    helper: "New accounts start with employee access.",
  },
  forgot: {
    title: "Reset your password",
    helper: "We will email you a link to set a new password.",
  },
};

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const { user, loading, error } = useSelector((state) => state.auth);

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot },
    reset: resetForgot,
  } = useForm({
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (data) => {
    try {
      await authService.login({ email: data.email, password: data.password }, dispatch);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleSignupSubmit = async (data) => {
    setSignupSuccess("");
    try {
      const result = await authService.signup(
        { email: data.email, password: data.password, fullName: data.fullName },
        dispatch
      );

      if (!result.session) {
        setSignupSuccess("Account created. Please check your email to confirm your account before signing in.");
      }
    } catch (err) {
      console.error("Signup failed:", err);
    }
  };

  const handleForgotSubmit = async (data) => {
    setForgotLoading(true);
    setForgotSuccess("");
    dispatch(clearError());
    try {
      await authService.forgotPassword(data.email);
      setForgotSuccess("Instructions to reset your password have been sent to your email.");
      resetForgot();
    } catch (err) {
      dispatch(loginFailure(err.message || "Failed to send reset email"));
    } finally {
      setForgotLoading(false);
    }
  };

  const switchMode = (newMode) => {
    dispatch(clearError());
    setForgotSuccess("");
    setSignupSuccess("");
    setMode(newMode);
  };

  const copy = MODE_COPY[mode];

  return (
    <div>
      <div className="lg:hidden mb-8">
        <Logo size={30} withWordmark />
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-accent-600 mb-2">
        AssetFlow
      </p>
      <h1 className="font-display text-2xl font-bold text-text-primary">
        {copy.title}
      </h1>
      <p className="text-sm text-text-secondary mt-1 mb-7">{copy.helper}</p>

      {error && mode === "forgot" && (
        <div className="mb-4 px-3 py-2.5 bg-danger-bg border border-danger-border text-danger rounded-default text-sm">
          {error}
        </div>
      )}

      {forgotSuccess && (
        <div className="mb-4 px-3 py-2.5 bg-success-bg border border-success-border text-success rounded-default text-sm">
          {forgotSuccess}
        </div>
      )}

      {mode === "login" && (
        <LoginForm
          onSubmit={handleLoginSubmit}
          submitLoading={loading}
          error={error}
          onForgotPassword={() => switchMode("forgot")}
        />
      )}

      {mode === "signup" && (
        <SignupForm
          onSubmit={handleSignupSubmit}
          submitLoading={loading}
          error={error}
          success={signupSuccess}
        />
      )}

      {mode === "forgot" && (
        <form onSubmit={handleSubmitForgot(handleForgotSubmit)} className="space-y-4">
          <Input
            label="Email"
            id="forgot-email"
            placeholder="name@company.com"
            error={errorsForgot.email?.message}
            {...registerForgot("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          <Button type="submit" loading={forgotLoading} className="w-full mt-2">
            Send reset link
          </Button>
        </form>
      )}

      <hr className="border-border my-7" />

      <div className="text-sm text-text-secondary">
        {mode === "login" && (
          <>
            Need an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className="text-accent-600 hover:text-accent-800 cursor-pointer font-medium transition-colors"
            >
              Create account
            </button>
          </>
        )}

        {mode === "signup" && (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="text-accent-600 hover:text-accent-800 cursor-pointer font-medium transition-colors"
            >
              Sign in
            </button>
          </>
        )}

        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="text-accent-600 hover:text-accent-800 cursor-pointer font-medium transition-colors"
          >
            Back to sign in
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
