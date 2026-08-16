import React, { useEffect, useState } from "react";
import { fetchAdminListings, toggleListingAdmin, deleteListingAdmin } from "../../api/admin.js";
import { formatPKR } from "../../utils/format.js";
import { Pause, Play, Trash2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { categoryLabel } from "../../utils/categoryLabel.js";

const Listings = () => {
  const { t } = useLanguage();
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
    if (!window.confirm(`${t("admin.deleteListingConfirmPrefix")} "${l.title}"${t("admin.deleteListingConfirmSuffix")}`)) return;
    await deleteListingAdmin(l._id);
    load();
  };

  return (
    <div>
      <h1 style={{ fontSize: 24 }}>{t("admin.nav.listings")}</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 16 }}>{total} {t("admin.totalListingsSuffix")}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        style={{ display: "flex", gap: 10, marginBottom: 18 }}
      >
        <input
          placeholder={t("admin.searchTitlePlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 320, padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--pp-border)" }}
        />
        <button type="submit" className="btn btn-primary">{t("search.searchButton")}</button>
      </form>

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>{t("dash.table.title")}</th>
              <th>{t("admin.table.seller")}</th>
              <th>{t("search.category")}</th>
              <th>{t("dash.table.price")}</th>
              <th>{t("dash.table.status")}</th>
              <th>{t("dash.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l._id}>
                <td>{l.title}</td>
                <td>
                  {l.seller?.businessName || `${l.seller?.firstName || ""} ${l.seller?.lastName || ""}`}
                  {l.seller?.kycStatus !== "approved" && (
                    <div style={{ fontSize: 10.5, color: "var(--pp-danger)" }}>{t("admin.kycNotApproved")}</div>
                  )}
                </td>
                <td>{categoryLabel({ id: l.category, label: l.category }, t)}</td>
                <td>{formatPKR(l.price)}</td>
                <td>
                  <span className={`status-pill ${l.isActive ? "active" : "paused"}`}>
                    {l.isActive ? t("dash.active") : t("dash.paused")}
                  </span>
                </td>
                <td style={{ display: "flex", gap: 4 }}>
                  <button className="icon-btn" title={t("admin.pauseActivate")} onClick={() => handleToggle(l)}>
                    {l.isActive ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button className="icon-btn" title={t("admin.deleteBtn")} onClick={() => handleDelete(l)}>
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
