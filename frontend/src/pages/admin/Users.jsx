import React, { useEffect, useState } from "react";
import { fetchUsers, suspendUser, unsuspendUser } from "../../api/admin.js";
import { Ban, CheckCircle2 } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    fetchUsers({ role: role || undefined, search: search || undefined, limit: 50 })
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
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
    const reason = window.prompt(`${u.firstName} ko suspend karne ki wajah likhein:`, "Policy violation");
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
      <h1 style={{ fontSize: 24 }}>Users</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 16 }}>{total} total users</p>

      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          placeholder="Naam, email, phone se search karein..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--pp-border)" }}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--pp-border)" }}>
          <option value="">Sab Roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="shop">Shop</option>
        </select>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {loading ? (
        <p>Load ho raha hai...</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Naam</th>
              <th>Role</th>
              <th>Contact</th>
              <th>City</th>
              <th>KYC</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.firstName} {u.lastName}{u.businessName ? ` (${u.businessName})` : ""}</td>
                <td>{u.role}</td>
                <td>
                  <div>{u.email}</div>
                  <div style={{ fontSize: 11, color: "var(--pp-muted)" }}>{u.phone}</div>
                </td>
                <td>{u.city}</td>
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
                    {u.isSuspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td>
                  {u.isSuspended ? (
                    <button className="icon-btn" title="Unsuspend" disabled={busyId === u._id} onClick={() => handleUnsuspend(u)}>
                      <CheckCircle2 size={16} />
                    </button>
                  ) : (
                    <button className="icon-btn" title="Suspend" disabled={busyId === u._id} onClick={() => handleSuspend(u)}>
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
