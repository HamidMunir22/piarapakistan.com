import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, KeyRound, Lock } from "lucide-react";
import api from "../api/client";
import PasswordStrength, { evaluatePassword } from "../components/PasswordStrength.jsx";

// ---------------------------------------------------------------------------
// 3-step "Forgot Password" flow:
//  1. Pick Email or Mobile Number, enter that identifier -> request a code
//  2. Enter the 6-digit code that arrived via the chosen channel
//  3. Set a new (strong) password
// Mirrors the Register/Verify OTP flow's look & feel so it feels consistent.
// ---------------------------------------------------------------------------
const ForgotPassword = () => {
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

  const methodLabel = method === "sms" ? "SMS" : "email";

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    if (!emailOrPhone.trim()) {
      setError(method === "sms" ? "Please enter your mobile number" : "Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { emailOrPhone: emailOrPhone.trim(), method });
      setSuccess(`If an account matches, a reset code has been sent via ${methodLabel}.`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/forgot-password", { emailOrPhone: emailOrPhone.trim(), method });
      setSuccess(`A new code has been sent via ${methodLabel}`);
    } catch (err) {
      setError("Could not resend the code");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }
    if (!evaluatePassword(newPassword).isStrong) {
      setError(
        "Please choose a stronger password — at least 8 characters with uppercase, lowercase, a number, and a special character (@#$%&*)."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Password and confirm password do not match");
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
      setError(err.response?.data?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-side">
        <h2>Forgot your password?</h2>
        <p>No worries — we'll send you a code to reset it securely.</p>
      </div>
      <div className="auth-form-col">
        <div className="auth-card">
          <h1>Reset Password</h1>
          <p className="subtitle">
            {step === 1 ? "Choose how you'd like to receive your reset code" : `Enter the code sent via ${methodLabel}`}
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {step === 1 && (
            <form onSubmit={handleRequestCode}>
              <div className="field">
                <label>Send my reset code via</label>
                <div className="otp-method-choice">
                  <button
                    type="button"
                    className={`otp-method-option ${method === "email" ? "active" : ""}`}
                    onClick={() => setMethod("email")}
                  >
                    <Mail size={20} />
                    Email
                  </button>
                  <button
                    type="button"
                    className={`otp-method-option ${method === "sms" ? "active" : ""}`}
                    onClick={() => setMethod("sms")}
                  >
                    <Phone size={20} />
                    SMS (mobile number)
                  </button>
                </div>
              </div>

              <div className="field">
                <label>{method === "sms" ? "Mobile Number" : "Email Address"}</label>
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
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset}>
              <div className="field">
                <label>Reset Code</label>
                <div className="input-icon-wrap">
                  <KeyRound size={16} className="input-icon" />
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label>New Password</label>
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
                <label>Confirm New Password</label>
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
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="auth-switch">
                Didn't get the code?{" "}
                <a onClick={handleResend} style={{ cursor: "pointer", color: "var(--pp-orange-dark)", fontWeight: 700 }}>
                  Resend
                </a>
              </div>
            </form>
          )}

          <div className="auth-switch">
            Remembered your password? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
