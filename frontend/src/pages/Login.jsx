import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [form, setForm] = useState({ emailOrPhone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      if (err.response?.data?.requiresOtp) {
        navigate("/verify-otp", { state: { phone: err.response.data.phone } });
        return;
      }
      setError(err.response?.data?.message || "Login nahi ho saka");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-side">
        <h2>Wapas khush aamdeed</h2>
        <p>Login karein aur apni services, orders aur dashboard dekhein.</p>
      </div>
      <div className="auth-form-col">
        <div className="auth-card">
          <h1>Login</h1>
          <p className="subtitle">Apna account access karein</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email ya Phone Number</label>
              <input
                value={form.emailOrPhone}
                onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Login ho raha hai..." : "Login Karein"}
            </button>
          </form>

          <div className="auth-switch">
            Account nahi hai? <Link to="/register">Register karein</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
