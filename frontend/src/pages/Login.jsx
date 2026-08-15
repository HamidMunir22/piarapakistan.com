import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import ReCaptcha from "../components/ReCaptcha.jsx";

const Login = () => {
  const [form, setForm] = useState({ emailOrPhone: "", password: "" });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { ...form, recaptchaToken });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      if (err.response?.data?.requiresOtp) {
        navigate("/verify-otp", { state: { phone: err.response.data.phone } });
        return;
      }
      // 423 = temporarily locked (brute-force protection), 401 = wrong credentials
      setError(err.response?.data?.message || "Login failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-side">
        <h2>Welcome back</h2>
        <p>Login to see your services, orders, and dashboard.</p>
      </div>
      <div className="auth-form-col">
        <div className="auth-card">
          <h1>Login</h1>
          <p className="subtitle">Access your account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email or Phone Number</label>
              <div className="input-icon-wrap">
                <User size={16} className="input-icon" />
                <input
                  value={form.emailOrPhone}
                  onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div className="forgot-password-link">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
            </div>

            <ReCaptcha onChange={setRecaptchaToken} />

            <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 10 }}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
