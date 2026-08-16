import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Package,
  ClipboardList,
  Percent,
  MessageSquareWarning,
} from "lucide-react";
import { fetchAdminStats } from "../../api/admin.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

const AdminLayout = () => {
  const { t } = useLanguage();
  const [badges, setBadges] = useState({ pendingKyc: 0, openComplaints: 0 });

  useEffect(() => {
    fetchAdminStats()
      .then((s) => setBadges({ pendingKyc: s.pendingKyc, openComplaints: s.openComplaints }))
      .catch(() => {});
  }, []);

  const linkClass = ({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">{t("admin.panelTitle")}</div>
        <NavLink to="/admin" end className={linkClass}>
          <LayoutDashboard size={16} /> {t("nav.dashboard")}
        </NavLink>
        <NavLink to="/admin/kyc" className={linkClass}>
          <ShieldCheck size={16} /> {t("admin.nav.kycApprovals")}
          {badges.pendingKyc > 0 && <span className="admin-nav-badge">{badges.pendingKyc}</span>}
        </NavLink>
        <NavLink to="/admin/users" className={linkClass}>
          <Users size={16} /> {t("admin.nav.users")}
        </NavLink>
        <NavLink to="/admin/listings" className={linkClass}>
          <Package size={16} /> {t("admin.nav.listings")}
        </NavLink>
        <NavLink to="/admin/orders" className={linkClass}>
          <ClipboardList size={16} /> {t("nav.orders")}
        </NavLink>
        <NavLink to="/admin/commission" className={linkClass}>
          <Percent size={16} /> {t("admin.nav.commission")}
        </NavLink>
        <NavLink to="/admin/complaints" className={linkClass}>
          <MessageSquareWarning size={16} /> {t("footer.helpCenter")}
          {badges.openComplaints > 0 && <span className="admin-nav-badge">{badges.openComplaints}</span>}
        </NavLink>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
