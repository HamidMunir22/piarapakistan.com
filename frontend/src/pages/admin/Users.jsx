import React, { useEffect, useState } from "react";
import { fetchUsers, suspendUser, unsuspendUser } from "../../api/admin.js";
import { Ban, CheckCircle2, FileSpreadsheet, FileText } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { formatDate } from "../../utils/format.js";
import { exportToExcel, exportToPDF } from "../../utils/exportData.js";

const Users = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const load = () => {
    setLoading(true);
    fetchUsers({ role: role || undefined, search: search || undefined, limit: 50 })
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  };

  // Export always re-fetches EVERY matching user (not just the current page
  // of 50) so the file reflects the full filtered list, then hands it to the
  // shared export helper. The backend's /admin/users endpoint has no hard
  // limit cap, so a very high limit here effectively means "all of them".
  const exportColumns = [
    { header: t("admin.table.name"), key: "name" },
    { header: t("admin.table.role"), key: "role" },
    { header: t("admin.emailLabel"), key: "email" },
    { header: t("admin.emailVerified"), key: "emailVerified" },
    { header: t("admin.phoneLabel"), key: "phone" },
    { header: t("admin.phoneVerified"), key: "phoneVerified" },
    { header: t("search.city"), key: "city" },
    { header: t("admin.table.kyc"), key: "kyc" },
    { header: t("dash.table.status"), key: "status" },
    { header: t("admin.joinedLabel"), key: "joined" },
  ];

  const buildExportRows = async () => {
    const data = await fetchUsers({ role: role || undefined, search: search || undefined, limit: 100000 });
    return data.users.map((u) => ({
      name: `${u.firstName} ${u.lastName}${u.businessName ? ` (${u.businessName})` : ""}`,
      role: u.role,
      email: u.email,
      emailVerified: u.isEmailVerified ? "Yes" : "No",
      phone: u.phone,
      phoneVerified: u.isPhoneVerified ? "Yes" : "No",
      city: u.city,
      kyc: ["seller", "shop"].includes(u.role) ? u.kycStatus : "—",
      status: u.isSuspended ? t("admin.suspended") : t("dash.active"),
      joined: formatDate(u.createdAt),
    }));
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const rows = await buildExportRows();
      exportToExcel(rows, exportColumns, "piarapakistan-users");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const rows = await buildExportRows();
      exportToPDF(rows, exportColumns, "piarapakistan-users", t("admin.nav.users"));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const handleSuspend = async (u) => {
    const reason = window.prompt(`${t("admin.suspendPromptPrefix")} ${u.firstName}${t("admin.suspendPromptSuffix")}`, t("admin.suspendDefaultReason"));
    if (reason === null) return;
    setBusyId(u._id);
    try {
      await suspendUser(u._id, reason);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const handleUnsuspend = async (u) => {
    setBusyId(u._id);
    try {
      await unsuspendUser(u._id);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24 }}>{t("admin.nav.users")}</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 16 }}>{total} {t("admin.totalUsersSuffix")}</p>

      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          placeholder={t("admin.searchNamePlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--pp-border)" }}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--pp-border)" }}>
          <option value="">{t("admin.allRoles")}</option>
          <option value="buyer">{t("auth.role.buyer")}</option>
          <option value="seller">{t("admin.roleSellerShort")}</option>
          <option value="shop">{t("admin.roleShopShort")}</option>
        </select>
        <button type="submit" className="btn btn-primary">{t("search.searchButton")}</button>
      </form>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <button className="btn btn-secondary" type="button" disabled={exporting} onClick={handleExportExcel}>
          <FileSpreadsheet size={15} /> {t("admin.exportExcel")}
        </button>
        <button className="btn btn-secondary" type="button" disabled={exporting} onClick={handleExportPDF}>
          <FileText size={15} /> {t("admin.exportPDF")}
        </button>
      </div>

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>{t("admin.table.name")}</th>
              <th>{t("admin.table.role")}</th>
              <th>{t("admin.table.contact")}</th>
              <th>{t("search.city")}</th>
              <th>{t("admin.joinedLabel")}</th>
              <th>{t("admin.table.kyc")}</th>
              <th>{t("dash.table.status")}</th>
              <th>{t("admin.table.action")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.firstName} {u.lastName}{u.businessName ? ` (${u.businessName})` : ""}</td>
                <td>{u.role}</td>
                <td>
                  <div>
                    {u.email}{" "}
                    {u.isEmailVerified && (
                      <CheckCircle2 size={12} style={{ color: "var(--pp-green-dark)", verticalAlign: "middle" }} aria-label={t("admin.emailVerified")} />
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--pp-muted)" }}>
                    {u.phone}{" "}
                    {u.isPhoneVerified && (
                      <CheckCircle2 size={11} style={{ color: "var(--pp-green-dark)", verticalAlign: "middle" }} aria-label={t("admin.phoneVerified")} />
                    )}
                  </div>
                </td>
                <td>{u.city}</td>
                <td>{formatDate(u.createdAt)}</td>
                <td>
                  {["seller", "shop"].includes(u.role) ? (
                    <span className={`status-pill ${u.kycStatus === "approved" ? "active" : "paused"}`}>
                      {u.kycStatus}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <span className={`status-pill ${u.isSuspended ? "paused" : "active"}`}>
                    {u.isSuspended ? t("admin.suspended") : t("dash.active")}
                  </span>
                </td>
                <td>
                  {u.isSuspended ? (
                    <button className="icon-btn" title={t("admin.unsuspend")} disabled={busyId === u._id} onClick={() => handleUnsuspend(u)}>
                      <CheckCircle2 size={16} />
                    </button>
                  ) : (
                    <button className="icon-btn" title={t("admin.suspend")} disabled={busyId === u._id} onClick={() => handleSuspend(u)}>
                      <Ban size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Users;
