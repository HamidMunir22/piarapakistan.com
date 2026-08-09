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

const AdminLayout = () => {
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
        <div className="admin-sidebar-title">Admin Panel</div>
        <NavLink to="/admin" end className={linkClass}>
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
        <NavLink to="/admin/kyc" className={linkClass}>
          <ShieldCheck size={16} /> KYC Approvals
          {badges.pendingKyc > 0 && <span className="admin-nav-badge">{badges.pendingKyc}</span>}
        </NavLink>
        <NavLink to="/admin/users" className={linkClass}>
          <Users size={16} /> Users
        </NavLink>
        <NavLink to="/admin/listings" className={linkClass}>
          <Package size={16} /> Listings
        </NavLink>
        <NavLink to="/admin/orders" className={linkClass}>
          <ClipboardList size={16} /> Orders
        </NavLink>
        <NavLink to="/admin/commission" className={linkClass}>
          <Percent size={16} /> Commission
        </NavLink>
        <NavLink to="/admin/complaints" className={linkClass}>
          <MessageSquareWarning size={16} /> Help Center
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
