import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const VerifyOtp = () => {
  const { t } = useLanguage();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const phone = state?.phone || "";
  const otpMethod = state?.otpMethod || "email";
  const methodLabel = otpMethod === "sms" ? t("auth.methodSms") : t("auth.methodEmail");

  const [digits, setDigits] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    const otp = digits.join("");
    if (otp.length !== 6) {
      setError(t("auth.verify.errIncomplete"));
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { phone, otp });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t("auth.verify.errFailedDefault"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/resend-otp", { phone, otpMethod });
      setSuccess(`${t("auth.verify.resentPrefix")} ${methodLabel}`);
    } catch (err) {
      setError(t("auth.verify.errResendFailed"));
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-side">
        <h2>{t("auth.verify.sideTitle")}</h2>
        <p>{t("auth.verify.sideText")}</p>
      </div>
      <div className="auth-form-col">
        <div className="auth-card">
          <div className="verify-icon-badge">
            <ShieldCheck size={28} />
          </div>
          <h1>{t("auth.verify.title")}</h1>
          <p className="subtitle">
            {phone
              ? `${t("auth.verify.codeSentViaPrefix")} ${methodLabel}${otpMethod === "sms" ? ` ${t("auth.verify.toPrefix")} ${phone}` : ""}`
              : `${t("auth.verify.checkYourPrefix")} ${methodLabel}`}
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="account-hold-notice">
            {otpMethod === "sms" ? t("auth.verify.smsHint") : t("auth.verify.emailHint")}
          </div>

          <form onSubmit={handleVerify}>
            <div className="otp-inputs">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  maxLength={1}
                  inputMode="numeric"
                />
              ))}
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? t("auth.verifying") : t("auth.verify.button")}
            </button>
          </form>

          <div className="auth-switch">
            {t("auth.verify.noCode")}{" "}
            <a onClick={handleResend} style={{ cursor: "pointer", color: "var(--pp-orange-dark)", fontWeight: 700 }}>
              {t("common.resend")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
