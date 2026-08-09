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
      setError("6 digit ka poora code darj karein");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { phone, otp });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verify nahi ho saka");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/resend-otp", { phone });
      setSuccess("Naya OTP bhej diya gaya hai");
    } catch (err) {
      setError("OTP dobara bhejne mein masla hua");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-side">
        <h2>Bas ek aakhri qadam</h2>
        <p>Apna phone number verify karein taake account mehfooz rahe.</p>
      </div>
      <div className="auth-form-col">
        <div className="auth-card">
          <h1>Phone Verify Karein</h1>
          <p className="subtitle">
            {phone ? `Code ${phone} par bheja gaya hai` : "Apna phone number check karein"}
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

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
              {loading ? "Verify ho raha hai..." : "Verify Karein"}
            </button>
          </form>

          <div className="auth-switch">
            Code nahi mila? <a onClick={handleResend} style={{ cursor: "pointer", color: "var(--pp-orange-dark)", fontWeight: 700 }}>Dobara bhejein</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
