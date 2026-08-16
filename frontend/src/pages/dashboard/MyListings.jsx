import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyListings, deleteListing, updateListing } from "../../api/listings";
import { useAuth } from "../../context/AuthContext.jsx";
import { Pencil, Trash2, Pause, Play } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

const formatPKR = (value) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(value);

const MyListings = () => {
  const { t } = useLanguage();
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
    if (!window.confirm(t("dash.deleteConfirm"))) return;
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
            {t("dash.myPrefix")} {user?.role === "shop" ? t("dash.productsWord") : t("dash.servicesWord")}
          </h1>
          <p style={{ color: "var(--pp-muted)", fontSize: 13.5 }}>
            {listings.length} {t("dash.listingCountSuffix")} • {t("dash.totalOrdersLabel")} {listings.reduce((s, l) => s + (l.orderCount || 0), 0)}
          </p>
        </div>
        <Link to="/dashboard/listings/new" className="btn btn-primary">
          {t("dash.addNewListingBtn")}
        </Link>
      </div>

      {user?.kycStatus === "pending" && (
        <div className="account-hold-notice">{t("dash.kycPendingNotice")}</div>
      )}
      {user?.kycStatus === "rejected" && (
        <div className="alert alert-error">{t("dash.kycRejectedNotice")}</div>
      )}

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : listings.length === 0 ? (
        <div className="empty-state">{t("dash.noListingsYet")}</div>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>{t("dash.table.title")}</th>
              <th>{t("search.category")}</th>
              <th>{t("dash.table.price")}</th>
              <th>{t("dash.table.orders")}</th>
              <th>{t("dash.table.rating")}</th>
              <th>{t("dash.table.status")}</th>
              <th>{t("dash.table.actions")}</th>
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
                    {l.isActive ? t("dash.active") : t("dash.paused")}
                  </span>
                </td>
                <td style={{ display: "flex", gap: 4 }}>
                  <button className="icon-btn" title={t("dash.pauseResume")} onClick={() => handleToggle(l)}>
                    {l.isActive ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <Link className="icon-btn" to={`/dashboard/listings/${l._id}/edit`} title={t("dash.edit")}>
                    <Pencil size={16} />
                  </Link>
                  <button className="icon-btn" title={t("dash.delete")} onClick={() => handleDelete(l._id)}>
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
