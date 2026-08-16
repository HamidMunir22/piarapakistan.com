import React, { useEffect, useState } from "react";
import { fetchAdminOrders } from "../../api/admin.js";
import { formatPKR } from "../../utils/format.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

const Orders = () => {
  const { t } = useLanguage();

  const STATUS_LABELS = {
    pending: t("orders.status.pending"),
    confirmed: t("orders.status.confirmed"),
    in_progress: t("orders.status.inProgress"),
    completed: t("orders.status.completed"),
    cancelled: t("orders.status.cancelled"),
  };

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAdminOrders({ status: status || undefined, limit: 50 })
      .then((data) => {
        setOrders(data.orders);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <h1 style={{ fontSize: 24 }}>{t("nav.orders")}</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 16 }}>{total} {t("admin.totalOrdersSuffix")}</p>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--pp-border)", marginBottom: 18 }}
      >
        <option value="">{t("admin.allStatus")}</option>
        {Object.entries(STATUS_LABELS).map(([k, label]) => (
          <option key={k} value={k}>{label}</option>
        ))}
      </select>

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>{t("dash.table.orderNum")}</th>
              <th>{t("dash.table.item")}</th>
              <th>{t("dash.table.buyer")}</th>
              <th>{t("admin.table.seller")}</th>
              <th>{t("cart.total")}</th>
              <th>{t("dash.table.commission")}</th>
              <th>{t("dash.table.status")}</th>
              <th>{t("admin.table.date")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{o.listingTitleSnapshot} (x{o.quantity})</td>
                <td>{o.buyer?.firstName} {o.buyer?.lastName}</td>
                <td>{o.seller?.businessName || `${o.seller?.firstName || ""} ${o.seller?.lastName || ""}`}</td>
                <td>{formatPKR(o.totalAmount)}</td>
                <td>
                  {formatPKR(o.commissionAmount)}
                  {o.commissionType === "percent" && o.commissionPercent != null ? ` (${o.commissionPercent}%)` : ` ${t("dash.fixedLabel")}`}
                </td>
                <td>{STATUS_LABELS[o.status]}</td>
                <td>{new Date(o.createdAt).toLocaleDateString("en-PK")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Orders;
