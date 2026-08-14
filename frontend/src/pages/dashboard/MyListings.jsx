import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyListings, deleteListing, updateListing } from "../../api/listings";
import { useAuth } from "../../context/AuthContext.jsx";
import { Pencil, Trash2, Pause, Play } from "lucide-react";

const formatPKR = (value) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(value);

const MyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchMyListings()
      .then(setListings)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    await deleteListing(id);
    load();
  };

  const handleToggle = async (listing) => {
    const fd = new FormData();
    fd.append("isActive", !listing.isActive);
    await updateListing(listing._id, fd);
    load();
  };

  const kycApproved = user?.kycStatus === "approved";

  return (
    <div className="container" style={{ padding: "36px 20px 60px" }}>
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>
            My {user?.role === "shop" ? "Products" : "Services"}
          </h1>
          <p style={{ color: "var(--pp-muted)", fontSize: 13.5 }}>
            {listings.length} listing(s) • Total orders: {listings.reduce((s, l) => s + (l.orderCount || 0), 0)}
          </p>
        </div>
        <Link to="/dashboard/listings/new" className="btn btn-primary">
          + Add New Listing
        </Link>
      </div>

      {user?.kycStatus === "pending" && (
        <div className="account-hold-notice">
          Your account is under verification. This is usually completed within 24 hours — you'll get an email and
          SMS the moment it's approved, even if that happens sooner. Listing is disabled until then.
        </div>
      )}
      {user?.kycStatus === "rejected" && (
        <div className="alert alert-error">
          Your account verification was not approved. Please contact support via the Help Center.
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : listings.length === 0 ? (
        <div className="empty-state">No listings yet. Use the button above to add your first one.</div>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Orders</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l._id}>
                <td>{l.title}</td>
                <td>{l.category}</td>
                <td>{formatPKR(l.price)}</td>
                <td>{l.orderCount}</td>
                <td>{l.ratingCount > 0 ? l.ratingAverage.toFixed(1) : "—"}</td>
                <td>
                  <span className={`status-pill ${l.isActive ? "active" : "paused"}`}>
                    {l.isActive ? "Active" : "Paused"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: 4 }}>
                  <button className="icon-btn" title="Pause/Resume" onClick={() => handleToggle(l)}>
                    {l.isActive ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <Link className="icon-btn" to={`/dashboard/listings/${l._id}/edit`} title="Edit">
                    <Pencil size={16} />
                  </Link>
                  <button className="icon-btn" title="Delete" onClick={() => handleDelete(l._id)}>
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

export default MyListings;
