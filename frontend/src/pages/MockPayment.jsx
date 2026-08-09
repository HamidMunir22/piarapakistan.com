import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { confirmMockPayment } from "../api/payments";
import { CreditCard, ShieldCheck } from "lucide-react";

const MockPayment = () => {
  const { intentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await confirmMockPayment(intentId);
      navigate("/orders", { state: { justOrdered: true, paymentSucceeded: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Payment confirm nahi ho saka");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "60px 20px", display: "flex", justifyContent: "center" }}>
      <div className="auth-card" style={{ maxWidth: 420, textAlign: "center" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--pp-orange-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <CreditCard size={26} color="var(--pp-orange-dark)" />
        </div>

        <h2 style={{ marginBottom: 6 }}>Test Payment Screen</h2>
        <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 20 }}>
          Real JazzCash/Easypaisa merchant credentials abhi is website mein configure nahi hain, is
          liye ye ek simulated (test) payment screen hai — jab real credentials `.env` mein add ho
          jayenge, buyer seedha asal gateway par redirect hoga.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <button className="btn btn-primary btn-block" onClick={handleConfirm} disabled={loading}>
          {loading ? "Processing..." : "Simulate Successful Payment"}
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, fontSize: 11.5, color: "var(--pp-muted)" }}>
          <ShieldCheck size={13} /> Test Mode — koi asal paisa transfer nahi ho raha
        </div>
      </div>
    </div>
  );
};

export default MockPayment;
