import React, { useEffect, useState } from "react";
import { fetchCommission, updateCommission, fetchUsers, updateUserCommission } from "../../api/admin.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

const Commission = () => {
  const { t } = useLanguage();
  const [globalType, setGlobalType] = useState("percent");
  const [globalPercent, setGlobalPercent] = useState(10);
  const [globalFixed, setGlobalFixed] = useState(50);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [sellers, setSellers] = useState([]);
  const [search, setSearch] = useState("");
  const [overrideBusyId, setOverrideBusyId] = useState(null);

  const loadGlobal = () =>
    fetchCommission().then((data) => {
      setGlobalType(data.commissionType);
      setGlobalPercent(data.commissionPercent);
      setGlobalFixed(data.commissionFixedAmount);
    });

  const loadSellers = () =>
    fetchUsers({ search: search || undefined, limit: 100 }).then((data) =>
      setSellers(data.users.filter((u) => ["seller", "shop"].includes(u.role)))
    );

  useEffect(() => {
    loadGlobal();
    loadSellers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveGlobal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCommission({
        commissionType: globalType,
        commissionPercent: Number(globalPercent),
        commissionFixedAmount: Number(globalFixed),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  // Per-seller override: type selector + one value field, "Default" clears the override
  const handleOverrideTypeChange = async (userId, type) => {
    setOverrideBusyId(userId);
    try {
      if (type === "default") {
        await updateUserCommission(userId, { commissionType: null });
      } else if (type === "percent") {
        await updateUserCommission(userId, { commissionType: "percent", commissionPercent: globalPercent });
      } else {
        await updateUserCommission(userId, { commissionType: "fixed", commissionFixedAmount: globalFixed });
      }
      loadSellers();
    } finally {
      setOverrideBusyId(null);
    }
  };

  const handleOverrideValueChange = async (userId, type, value) => {
    setOverrideBusyId(userId);
    try {
      if (type === "percent") {
        await updateUserCommission(userId, { commissionType: "percent", commissionPercent: Number(value) });
      } else {
        await updateUserCommission(userId, { commissionType: "fixed", commissionFixedAmount: Number(value) });
      }
      loadSellers();
    } finally {
      setOverrideBusyId(null);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24 }}>{t("admin.nav.commission")}</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 20 }}>
        {t("admin.commissionSubtitle")}
      </p>

      <form onSubmit={handleSaveGlobal} className="auth-card" style={{ maxWidth: 420, marginBottom: 30 }}>
        <div className="section-label">{t("admin.globalCommissionTitle")}</div>

        <div className="field">
          <label>{t("admin.commissionTypeLabel")}</label>
          <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
              <input type="radio" checked={globalType === "percent"} onChange={() => setGlobalType("percent")} />
              {t("admin.percentOption")}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
              <input type="radio" checked={globalType === "fixed"} onChange={() => setGlobalType("fixed")} />
              {t("admin.fixedAmountOption")}
            </label>
          </div>
        </div>

        {globalType === "percent" ? (
          <div className="field">
            <label>{t("admin.percentOption")}</label>
            <input type="number" min="0" max="100" step="0.5" value={globalPercent} onChange={(e) => setGlobalPercent(e.target.value)} />
            <span className="field-hint">{t("admin.percentHint")}</span>
          </div>
        ) : (
          <div className="field">
            <label>{t("admin.fixedAmountOption")}</label>
            <input type="number" min="0" step="5" value={globalFixed} onChange={(e) => setGlobalFixed(e.target.value)} />
            <span className="field-hint">{t("admin.fixedHint")}</span>
          </div>
        )}

        <p style={{ fontSize: 11.5, color: "var(--pp-muted)", margin: "0 0 14px" }}>
          {t("admin.globalApplyNote")}
        </p>

        <button className="btn btn-primary btn-block" disabled={saving}>
          {saving ? t("admin.saving") : saved ? t("admin.savedCheck") : t("admin.saveBtn")}
        </button>
      </form>

      <div className="section-label" style={{ marginTop: 0 }}>{t("admin.perSellerOverrideTitle")}</div>
      <p style={{ color: "var(--pp-muted)", fontSize: 13, marginBottom: 12 }}>
        {t("admin.perSellerOverrideText")}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          loadSellers();
        }}
        style={{ display: "flex", gap: 10, marginBottom: 14 }}
      >
        <input
          placeholder={t("admin.searchSellerPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 320, padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--pp-border)" }}
        />
        <button type="submit" className="btn btn-secondary">{t("search.searchButton")}</button>
      </form>

      <table className="dashboard-table">
        <thead>
          <tr>
            <th>{t("admin.table.sellerShop")}</th>
            <th>{t("search.category")}</th>
            <th>{t("admin.table.override")}</th>
            <th>{t("admin.table.value")}</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((s) => {
            const overrideType = s.commissionType || "default";
            return (
              <tr key={s._id}>
                <td>{s.businessName || `${s.firstName} ${s.lastName}`}</td>
                <td>{s.category}</td>
                <td>
                  <select
                    value={overrideType}
                    disabled={overrideBusyId === s._id}
                    onChange={(e) => handleOverrideTypeChange(s._id, e.target.value)}
                    style={{ padding: "6px 8px", borderRadius: 8, border: "1.5px solid var(--pp-border)" }}
                  >
                    <option value="default">{t("admin.defaultOption")} ({globalType === "percent" ? `${globalPercent}%` : `Rs. ${globalFixed}`})</option>
                    <option value="percent">{t("admin.percentOption")}</option>
                    <option value="fixed">{t("admin.fixedRsOption")}</option>
                  </select>
                </td>
                <td>
                  {overrideType !== "default" && (
                    <input
                      type="number"
                      min="0"
                      step={overrideType === "percent" ? 0.5 : 5}
                      disabled={overrideBusyId === s._id}
                      defaultValue={overrideType === "percent" ? s.commissionPercent ?? "" : s.commissionFixedAmount ?? ""}
                      onBlur={(e) => handleOverrideValueChange(s._id, overrideType, e.target.value)}
                      style={{ width: 110, padding: "6px 10px", borderRadius: 8, border: "1.5px solid var(--pp-border)" }}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Commission;
