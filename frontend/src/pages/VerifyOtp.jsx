import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";

const VerifyOtp = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const phone = state?.phone || "";

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
      setError("Please enter the full 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { phone, otp });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/resend-otp", { phone });
      setSuccess("A new code has been sent via SMS and email");
    } catch (err) {
      setError("Could not resend the code");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-side">
        <h2>Just one last step</h2>
        <p>Verify your phone number to keep your account secure.</p>
      </div>
      <div className="auth-form-col">
        <div className="auth-card">
          <h1>Verify Your Phone</h1>
          <p className="subtitle">
            {phone ? `A code was sent to ${phone} by SMS and to your email` : "Check your phone and email"}
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="account-hold-notice">
            Didn't get an SMS? We always send the same code to your email too — check your inbox (and spam folder).
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
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          <div className="auth-switch">
            Didn't get the code?{" "}
            <a onClick={handleResend} style={{ cursor: "pointer", color: "var(--pp-orange-dark)", fontWeight: 700 }}>
              Resend
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
