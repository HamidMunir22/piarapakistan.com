import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminStats } from "../../api/admin.js";
import { formatPKR } from "../../utils/format.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

const StatCard = ({ label, value, accent }) => (
  <div className="stat-card">
    <div className="stat-card-label">{label}</div>
    <div className={`stat-card-value ${accent ? "accent" : ""}`}>{value}</div>
  </div>
);

const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAdminStats().then(setStats);
  }, []);

  if (!stats) return <p>{t("common.loading")}</p>;

  return (
    <div>
      <h1 style={{ fontSize: 24 }}>{t("nav.dashboard")}</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5 }}>{t("admin.dashboardSubtitle")}</p>

      <div className="stat-grid">
        <StatCard label={t("admin.stat.totalUsers")} value={stats.totalUsers} />
        <StatCard label={t("admin.stat.buyers")} value={stats.totalBuyers} />
        <StatCard label={t("admin.stat.sellers")} value={stats.totalSellers} />
        <StatCard label={t("admin.stat.shops")} value={stats.totalShops} />
        <StatCard label={t("admin.stat.activeListings")} value={`${stats.activeListings} / ${stats.totalListings}`} />
        <StatCard label={t("admin.stat.totalOrders")} value={stats.totalOrders} />
        <StatCard label={t("admin.stat.completedOrders")} value={stats.completedOrders} />
        <StatCard label={t("admin.stat.platformEarning")} value={formatPKR(stats.totalCommission)} accent />
        <StatCard label={t("admin.stat.totalGMV")} value={formatPKR(stats.totalGMV)} accent />
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {stats.pendingKyc > 0 && (
          <Link to="/admin/kyc" className="alert alert-error" style={{ display: "block", textDecoration: "none" }}>
            ⚠️ {stats.pendingKyc} {t("admin.kycWaitingSuffix")}
          </Link>
        )}
        {stats.openComplaints > 0 && (
          <Link to="/admin/complaints" className="alert alert-error" style={{ display: "block", textDecoration: "none" }}>
            📬 {stats.openComplaints} {t("admin.complaintsOpenSuffix")}
          </Link>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
