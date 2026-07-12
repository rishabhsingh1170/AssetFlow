import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import Card from "../../../components/ui/Card";
import { authService } from "../services/auth.service";
import { clearError } from "../auth.slice";

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const { user, loading, error } = useSelector((state) => state.auth);

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
    try {
      await authService.signup(
        { email: data.email, password: data.password, fullName: data.fullName },
        dispatch
      );
    } catch (err) {
      console.error("Signup failed:", err);
    }
  };

  const toggleMode = () => {
    dispatch(clearError());
    setIsLogin(!isLogin);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-surface-0 px-4">
      <Card className="w-full max-w-sm border border-border bg-surface-1 p-8 shadow-2xl rounded-card text-center">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-4 select-none">
            AssetFlow – {isLogin ? "login" : "sign up"}
          </h2>
          <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center bg-surface-2 text-accent-400 font-bold text-sm tracking-wider shadow-sm select-none">
            AF
          </div>
        </div>

        {isLogin ? (
          <LoginForm
            onSubmit={handleLoginSubmit}
            submitLoading={loading}
            error={error}
          />
        ) : (
          <SignupForm
            onSubmit={handleSignupSubmit}
            submitLoading={loading}
            error={error}
          />
        )}

        <hr className="border-border my-6" />

        <div className="text-xs text-text-secondary select-none">
          {isLogin ? "Need an account? " : "Already have an account? "}
          <span
            onClick={toggleMode}
            className="text-accent-400 hover:text-accent-200 cursor-pointer font-semibold transition-colors"
          >
            {isLogin ? "Create Account" : "Sign In"}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
