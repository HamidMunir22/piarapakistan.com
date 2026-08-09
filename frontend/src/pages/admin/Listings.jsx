import React, { useEffect, useState } from "react";
import { fetchAdminListings, toggleListingAdmin, deleteListingAdmin } from "../../api/admin.js";
import { formatPKR } from "../../utils/format.js";
import { Pause, Play, Trash2 } from "lucide-react";

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchAdminListings({ search: search || undefined, limit: 50 })
      .then((data) => {
        setListings(data.listings);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = async (l) => {
    await toggleListingAdmin(l._id, { isActive: !l.isActive });
    load();
  };

  const handleDelete = async (l) => {
    if (!window.confirm(`"${l.title}" delete karni hai?`)) return;
    await deleteListingAdmin(l._id);
    load();
  };

  return (
    <div>
      <h1 style={{ fontSize: 24 }}>Listings</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 16 }}>{total} total listings</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        style={{ display: "flex", gap: 10, marginBottom: 18 }}
      >
        <input
          placeholder="Title se search karein..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 320, padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--pp-border)" }}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {loading ? (
        <p>Load ho raha hai...</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Seller</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l._id}>
                <td>{l.title}</td>
                <td>
                  {l.seller?.businessName || `${l.seller?.firstName || ""} ${l.seller?.lastName || ""}`}
                  {l.seller?.kycStatus !== "approved" && (
                    <div style={{ fontSize: 10.5, color: "var(--pp-danger)" }}>KYC not approved</div>
                  )}
                </td>
                <td>{l.category}</td>
                <td>{formatPKR(l.price)}</td>
                <td>
                  <span className={`status-pill ${l.isActive ? "active" : "paused"}`}>
                    {l.isActive ? "Active" : "Paused"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: 4 }}>
                  <button className="icon-btn" title="Pause/Activate" onClick={() => handleToggle(l)}>
                    {l.isActive ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button className="icon-btn" title="Delete" onClick={() => handleDelete(l)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Listings;
