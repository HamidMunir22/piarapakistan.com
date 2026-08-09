import React, { useEffect, useState } from "react";
import { fetchAllComplaints, respondToComplaint } from "../../api/admin.js";

const STATUS_LABELS = {
  open: "Open",
  in_progress: "Jaari hai",
  resolved: "Resolve ho gaya",
  rejected: "Reject",
};

const ComplaintRow = ({ complaint, onUpdated }) => {
  const [reply, setReply] = useState(complaint.adminReply || "");
  const [busy, setBusy] = useState(false);

  const handleAction = async (status) => {
    setBusy(true);
    try {
      await respondToComplaint(complaint._id, { status, adminReply: reply });
      onUpdated();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{complaint.subject}</div>
          <div style={{ fontSize: 12.5, color: "var(--pp-muted)", marginTop: 2 }}>
            {complaint.user?.firstName} {complaint.user?.lastName} ({complaint.user?.role}) • {complaint.category}
            {complaint.order && ` • Order: ${complaint.order.orderNumber}`}
          </div>
        </div>
        <span className={`status-pill ${complaint.status === "resolved" ? "active" : "paused"}`}>
          {STATUS_LABELS[complaint.status]}
        </span>
      </div>

      <p style={{ margin: "12px 0", fontSize: 13.5, lineHeight: 1.6 }}>{complaint.message}</p>

      <textarea
        rows={2}
        placeholder="Apna jawab likhein..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" disabled={busy} onClick={() => handleAction("in_progress")}>
          Jawab Bhejein
        </button>
        <button className="btn btn-secondary" disabled={busy} onClick={() => handleAction("resolved")}>
          Resolved Mark Karein
        </button>
        <button className="icon-btn" disabled={busy} onClick={() => handleAction("rejected")}>
          Reject
        </button>
      </div>
    </div>
  );
};

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchAllComplaints({ status: status || undefined })
      .then(setComplaints)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div>
      <h1 style={{ fontSize: 24 }}>Help Center</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 16 }}>
        Users ki complaints aur fraud reports yahan dekhein aur resolve karein.
      </p>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--pp-border)", marginBottom: 18 }}
      >
        <option value="">Sab Status</option>
        {Object.entries(STATUS_LABELS).map(([k, label]) => (
          <option key={k} value={k}>{label}</option>
        ))}
      </select>

      {loading ? (
        <p>Load ho raha hai...</p>
      ) : complaints.length === 0 ? (
        <div className="empty-state">Koi complaint nahi mili. 🎉</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {complaints.map((c) => (
            <ComplaintRow key={c._id} complaint={c} onUpdated={load} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Complaints;
