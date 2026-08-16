import React, { useEffect, useState } from "react";
import { fetchPendingKyc, approveKyc, rejectKyc } from "../../api/admin.js";
import { resolveImageUrl } from "../../utils/format.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { categoryLabel } from "../../utils/categoryLabel.js";

const KycApprovals = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    fetchPendingKyc()
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await approveKyc(id);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm(t("admin.rejectConfirm"))) return;
    setBusyId(id);
    try {
      await rejectKyc(id);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24 }}>{t("admin.nav.kycApprovals")}</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 20 }}>
        {t("admin.kycApprovalsSubtitle")}
      </p>

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : users.length === 0 ? (
        <div className="empty-state">{t("admin.noPendingKyc")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {users.map((u) => (
            <div key={u._id} className="auth-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {u.firstName} {u.lastName} — <span style={{ color: "var(--pp-orange-dark)" }}>{u.role}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--pp-muted)" }}>
                    {u.businessName} • {u.category === "other" ? u.customCategoryName : categoryLabel({ id: u.category, label: u.category }, t)} • {u.city}
                    {u.area ? `, ${u.area}` : ""}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--pp-muted)", marginTop: 4 }}>
                    {u.email} • {u.phone} • CNIC: {u.cnicNumber}
                  </div>
                  {u.verificationRequestedAt && (
                    <div style={{ fontSize: 12, color: "var(--pp-orange-dark)", marginTop: 4, fontWeight: 600 }}>
                      {t("admin.requestedPrefix")} {new Date(u.verificationRequestedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--pp-muted)", marginBottom: 6 }}>
                    {t("admin.idCardFrontLabel")}
                  </div>
                  {u.idCardFrontImage ? (
                    <img src={resolveImageUrl(u.idCardFrontImage)} alt="ID front" className="kyc-doc-thumb" />
                  ) : (
                    <div className="kyc-doc-thumb" />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--pp-muted)", marginBottom: 6 }}>
                    {t("admin.idCardBackLabel")}
                  </div>
                  {u.idCardBackImage ? (
                    <img src={resolveImageUrl(u.idCardBackImage)} alt="ID back" className="kyc-doc-thumb" />
                  ) : (
                    <div className="kyc-doc-thumb" />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--pp-muted)", marginBottom: 6 }}>
                    {t("admin.selfieWithIdLabel")}
                  </div>
                  {u.idCardSelfieImage ? (
                    <img src={resolveImageUrl(u.idCardSelfieImage)} alt="Selfie holding ID" className="kyc-doc-thumb" />
                  ) : (
                    <div className="kyc-doc-thumb" />
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" disabled={busyId === u._id} onClick={() => handleApprove(u._id)}>
                  {t("admin.approveBtn")}
                </button>
                <button className="btn btn-secondary" disabled={busyId === u._id} onClick={() => handleReject(u._id)}>
                  {t("admin.rejectBtn")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KycApprovals;
