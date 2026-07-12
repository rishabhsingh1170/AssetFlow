import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { authService } from "../services/auth.service";
import { clearError, loginFailure } from "../auth.slice";

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

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-surface-0 px-4">
      <Card className="w-full max-w-sm border border-border bg-surface-1 p-8 shadow-2xl rounded-card text-center">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-4 select-none">
            AssetFlow – {mode === "login" ? "login" : mode === "signup" ? "sign up" : "forgot password"}
          </h2>
          <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center bg-surface-2 text-accent-400 font-bold text-sm tracking-wider shadow-sm select-none">
            AF
          </div>
        </div>

        {error && mode === "forgot" && (
          <div className="mb-4 p-3 bg-[rgba(224,100,90,0.08)] border border-[rgba(224,100,90,0.2)] text-danger rounded-default text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {forgotSuccess && (
          <div className="mb-4 p-3 bg-[rgba(46,204,113,0.08)] border border-[rgba(46,204,113,0.2)] text-accent-100 rounded-default text-xs font-semibold text-center">
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
            <Button
              type="submit"
              loading={forgotLoading}
              className="w-full font-bold uppercase tracking-wider text-xs py-2.5 mt-2"
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <hr className="border-border my-6" />

        <div className="text-xs text-text-secondary select-none">
          {mode === "login" && (
            <>
              Need an account?{" "}
              <span
                onClick={() => switchMode("signup")}
                className="text-accent-400 hover:text-accent-200 cursor-pointer font-semibold transition-colors"
              >
                Create Account
              </span>
            </>
          )}

          {mode === "signup" && (
            <>
              Already have an account?{" "}
              <span
                onClick={() => switchMode("login")}
                className="text-accent-400 hover:text-accent-200 cursor-pointer font-semibold transition-colors"
              >
                Sign In
              </span>
            </>
          )}

          {mode === "forgot" && (
            <span
              onClick={() => switchMode("login")}
              className="text-accent-400 hover:text-accent-200 cursor-pointer font-semibold transition-colors"
            >
              Back to Sign In
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
