import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminStats } from "../../api/admin.js";
import { formatPKR } from "../../utils/format.js";

const StatCard = ({ label, value, accent }) => (
  <div className="stat-card">
    <div className="stat-card-label">{label}</div>
    <div className={`stat-card-value ${accent ? "accent" : ""}`}>{value}</div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAdminStats().then(setStats);
  }, []);

  if (!stats) return <p>Load ho raha hai...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 24 }}>Dashboard</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5 }}>PiaraPakistan ka overall overview</p>

      <div className="stat-grid">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Buyers" value={stats.totalBuyers} />
        <StatCard label="Sellers" value={stats.totalSellers} />
        <StatCard label="Shops" value={stats.totalShops} />
        <StatCard label="Active Listings" value={`${stats.activeListings} / ${stats.totalListings}`} />
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Completed Orders" value={stats.completedOrders} />
        <StatCard label="Platform Earning (Commission)" value={formatPKR(stats.totalCommission)} accent />
        <StatCard label="Total GMV (Sales Volume)" value={formatPKR(stats.totalGMV)} accent />
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {stats.pendingKyc > 0 && (
          <Link to="/admin/kyc" className="alert alert-error" style={{ display: "block", textDecoration: "none" }}>
            ⚠️ {stats.pendingKyc} seller/shop KYC approval ka intezar kar rahe hain — review karein
          </Link>
        )}
        {stats.openComplaints > 0 && (
          <Link to="/admin/complaints" className="alert alert-error" style={{ display: "block", textDecoration: "none" }}>
            📬 {stats.openComplaints} complaints open hain — Help Center check karein
          </Link>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
