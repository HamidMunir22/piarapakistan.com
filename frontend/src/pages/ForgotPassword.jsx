import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, KeyRound, Lock } from "lucide-react";
import api from "../api/client";
import PasswordStrength, { evaluatePassword } from "../components/PasswordStrength.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

// ---------------------------------------------------------------------------
// 3-step "Forgot Password" flow:
//  1. Pick Email or Mobile Number, enter that identifier -> request a code
//  2. Enter the 6-digit code that arrived via the chosen channel
//  3. Set a new (strong) password
// Mirrors the Register/Verify OTP flow's look & feel so it feels consistent.
// ---------------------------------------------------------------------------
const ForgotPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = request code, 2 = enter code + new password
  const [method, setMethod] = useState("email");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const methodLabel = method === "sms" ? t("auth.methodSms") : t("auth.methodEmail");

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    if (!emailOrPhone.trim()) {
      setError(method === "sms" ? t("auth.forgot.errEnterMobile") : t("auth.forgot.errEnterEmail"));
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { emailOrPhone: emailOrPhone.trim(), method });
      setSuccess(`${t("auth.forgot.successSentPrefix")} ${methodLabel}.`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || t("auth.forgot.errSendFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/forgot-password", { emailOrPhone: emailOrPhone.trim(), method });
      setSuccess(`${t("auth.verify.resentPrefix")} ${methodLabel}`);
    } catch (err) {
      setError(t("auth.verify.errResendFailed"));
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError(t("auth.verify.errIncomplete"));
      return;
    }
    if (!evaluatePassword(newPassword).isStrong) {
      setError(t("auth.password.strengthError"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("auth.password.mismatchError"));
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        emailOrPhone: emailOrPhone.trim(),
        method,
        otp: otp.trim(),
        newPassword,
      });
      navigate("/login", { state: { passwordResetDone: true } });
    } catch (err) {
      setError(err.response?.data?.message || t("auth.forgot.errResetFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-side">
        <h2>{t("auth.forgot.sideTitle")}</h2>
        <p>{t("auth.forgot.sideText")}</p>
      </div>
      <div className="auth-form-col">
        <div className="auth-card">
          <h1>{t("auth.forgot.title")}</h1>
          <p className="subtitle">
            {step === 1 ? t("auth.forgot.step1Subtitle") : `${t("auth.verify.codeSentViaPrefix")} ${methodLabel}`}
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {step === 1 && (
            <form onSubmit={handleRequestCode}>
              <div className="field">
                <label>{t("auth.forgot.sendViaLabel")}</label>
                <div className="otp-method-choice">
                  <button
                    type="button"
                    className={`otp-method-option ${method === "email" ? "active" : ""}`}
                    onClick={() => setMethod("email")}
                  >
                    <Mail size={20} />
                    {t("common.email")}
                  </button>
                  <button
                    type="button"
                    className={`otp-method-option ${method === "sms" ? "active" : ""}`}
                    onClick={() => setMethod("sms")}
                  >
                    <Phone size={20} />
                    {t("auth.forgot.smsMobileOption")}
                  </button>
                </div>
              </div>

              <div className="field">
                <label>{method === "sms" ? t("common.mobileNumber") : t("auth.emailAddressLabel")}</label>
                <div className="input-icon-wrap">
                  {method === "sms" ? <Phone size={16} className="input-icon" /> : <Mail size={16} className="input-icon" />}
                  <input
                    type={method === "sms" ? "text" : "email"}
                    placeholder={method === "sms" ? "+92 3XX XXXXXXX" : "you@example.com"}
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 10 }}>
                {loading ? t("contact.sending") : t("auth.forgot.sendCodeBtn")}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset}>
              <div className="field">
                <label>{t("auth.forgot.resetCodeLabel")}</label>
                <div className="input-icon-wrap">
                  <KeyRound size={16} className="input-icon" />
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder={t("auth.forgot.sixDigitPlaceholder")}
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label>{t("auth.newPasswordLabel")}</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                <PasswordStrength password={newPassword} />
              </div>
              <div className="field">
                <label>{t("auth.confirmNewPasswordLabel")}</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 10 }}>
                {loading ? t("auth.forgot.resetting") : t("auth.forgot.title")}
              </button>

              <div className="auth-switch">
                {t("auth.verify.noCode")}{" "}
                <a onClick={handleResend} style={{ cursor: "pointer", color: "var(--pp-orange-dark)", fontWeight: 700 }}>
                  {t("common.resend")}
                </a>
              </div>
            </form>
          )}

          <div className="auth-switch">
            {t("auth.forgot.rememberedPassword")} <Link to="/login">{t("nav.login")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
