import React, { useEffect, useState } from "react";
import { fileComplaint, fetchMyComplaints } from "../api/admin.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

const CATEGORY_LABELS = {
  fraud: "Fraud / Scam",
  payment: "Payment Issue",
  quality: "Service/Product Quality",
  delivery: "Delivery Issue",
  account: "Account Issue",
  other: "Other",
};

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const HelpCenter = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: "", message: "", category: "other" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [complaints, setComplaints] = useState([]);

  const loadComplaints = () => {
    if (user) fetchMyComplaints().then(setComplaints);
  };

  useEffect(() => {
    loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fileComplaint(form);
      setForm({ subject: "", message: "", category: "other" });
      setSuccess(true);
      loadComplaints();
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>Help Center</h2>
        <p style={{ color: "var(--pp-muted)", marginBottom: 20 }}>
          Please login to file a complaint or report fraud.
        </p>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "36px 20px 60px", maxWidth: 640 }}>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Help Center</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 24 }}>
        Facing a problem, suspect fraud, or have a question? Let us know here and we'll respond quickly.
      </p>

      {success && <div className="alert alert-success">Your complaint has been submitted. We'll review it soon.</div>}

      <form onSubmit={handleSubmit} className="auth-card" style={{ marginBottom: 30 }}>
        <div className="field">
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Subject</label>
          <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
        </div>
        <div className="field">
          <label>Details</label>
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Sending..." : "Submit Complaint"}
        </button>
      </form>

      {complaints.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Your Complaints</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {complaints.map((c) => (
              <div key={c._id} className="auth-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700 }}>{c.subject}</div>
                  <span className={`status-pill ${c.status === "resolved" ? "active" : "paused"}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--pp-muted)", margin: "8px 0" }}>{c.message}</p>
                {c.adminReply && (
                  <div style={{ background: "var(--pp-cream)", borderRadius: 8, padding: 10, fontSize: 13 }}>
                    <b>Team's reply:</b> {c.adminReply}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HelpCenter;
