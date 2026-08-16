import React, { useEffect, useState } from "react";
import { fetchAllComplaints, respondToComplaint } from "../../api/admin.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

const ComplaintRow = ({ complaint, onUpdated }) => {
  const { t } = useLanguage();
  const [reply, setReply] = useState(complaint.adminReply || "");
  const [busy, setBusy] = useState(false);

  const STATUS_LABELS = {
    open: t("help.status.open"),
    in_progress: t("help.status.inProgress"),
    resolved: t("help.status.resolved"),
    rejected: t("help.status.rejected"),
  };

  const COMPLAINT_CATEGORY_LABELS = {
    fraud: t("admin.complaintCategory.fraud"),
    payment: t("admin.complaintCategory.payment"),
    quality: t("admin.complaintCategory.quality"),
    delivery: t("admin.complaintCategory.delivery"),
    account: t("admin.complaintCategory.account"),
    other: t("admin.complaintCategory.other"),
  };

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
            {complaint.user?.firstName} {complaint.user?.lastName} ({complaint.user?.role}) • {COMPLAINT_CATEGORY_LABELS[complaint.category] || complaint.category}
            {complaint.order && ` • ${t("admin.orderNumberPrefix")} ${complaint.order.orderNumber}`}
          </div>
        </div>
        <span className={`status-pill ${complaint.status === "resolved" ? "active" : "paused"}`}>
          {STATUS_LABELS[complaint.status]}
        </span>
      </div>

      <p style={{ margin: "12px 0", fontSize: 13.5, lineHeight: 1.6 }}>{complaint.message}</p>

      <textarea
        rows={2}
        placeholder={t("admin.replyPlaceholder")}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" disabled={busy} onClick={() => handleAction("in_progress")}>
          {t("admin.sendReplyBtn")}
        </button>
        <button className="btn btn-secondary" disabled={busy} onClick={() => handleAction("resolved")}>
          {t("admin.markResolvedBtn")}
        </button>
        <button className="icon-btn" disabled={busy} onClick={() => handleAction("rejected")}>
          {t("admin.rejectBtn")}
        </button>
      </div>
    </div>
  );
};

const Complaints = () => {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const STATUS_LABELS = {
    open: t("help.status.open"),
    in_progress: t("help.status.inProgress"),
    resolved: t("help.status.resolved"),
    rejected: t("help.status.rejected"),
  };

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
      <h1 style={{ fontSize: 24 }}>{t("footer.helpCenter")}</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 16 }}>
        {t("admin.complaintsSubtitle")}
      </p>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--pp-border)", marginBottom: 18 }}
      >
        <option value="">{t("admin.allStatus")}</option>
        {Object.entries(STATUS_LABELS).map(([k, label]) => (
          <option key={k} value={k}>{label}</option>
        ))}
      </select>

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : complaints.length === 0 ? (
        <div className="empty-state">{t("admin.noComplaints")}</div>
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
