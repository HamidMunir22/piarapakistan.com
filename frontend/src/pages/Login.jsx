import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import ReCaptcha from "../components/ReCaptcha.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const Login = () => {
  const { t } = useLanguage();
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
      if (err.response?.data?.requiresAdminOtp) {
        navigate("/admin-verify-otp", { state: { email: err.response.data.email } });
        return;
      }
      if (err.response?.data?.requiresOtp) {
        navigate("/verify-otp", { state: { phone: err.response.data.phone } });
        return;
      }
      // 423 = temporarily locked (brute-force protection), 401 = wrong credentials
      setError(err.response?.data?.message || t("auth.login.failedDefault"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-side">
        <h2>{t("auth.login.welcomeBack")}</h2>
        <p>{t("auth.login.sideText")}</p>
      </div>
      <div className="auth-form-col">
        <div className="auth-card">
          <h1>{t("nav.login")}</h1>
          <p className="subtitle">{t("auth.login.subtitle")}</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>{t("auth.emailOrPhone")}</label>
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
              <label>{t("auth.passwordLabel")}</label>
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
                <Link to="/forgot-password">{t("auth.forgotPasswordLink")}</Link>
              </div>
            </div>

            <ReCaptcha onChange={setRecaptchaToken} />

            <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 10 }}>
              {loading ? t("auth.login.loggingIn") : t("nav.login")}
            </button>
          </form>

          <div className="auth-switch">
            {t("auth.login.noAccount")} <Link to="/register">{t("nav.register")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
