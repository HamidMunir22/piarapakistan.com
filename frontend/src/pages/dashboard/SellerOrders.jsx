import React, { useEffect, useState } from "react";
import { fetchSellerOrders, updateOrderStatus } from "../../api/orders";
import { formatPKR } from "../../utils/format.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

const SellerOrders = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const STATUS_LABELS = {
    pending: t("orders.status.pending"),
    confirmed: t("orders.status.confirmed"),
    in_progress: t("orders.status.inProgress"),
    completed: t("orders.status.completed"),
    cancelled: t("orders.status.cancelled"),
  };

  const NEXT_ACTION = {
    pending: { next: "confirmed", label: t("dash.action.confirm") },
    confirmed: { next: "in_progress", label: t("dash.action.start") },
    in_progress: { next: "completed", label: t("dash.action.complete") },
  };

  const load = () => {
    setLoading(true);
    fetchSellerOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdate = async (order, status) => {
    setBusyId(order._id);
    try {
      await updateOrderStatus(order._id, status, status === "cancelled" ? t("dash.action.cancelledBySeller") : undefined);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const totalPayout = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.sellerPayout, 0);

  return (
    <div className="container" style={{ padding: "36px 20px 60px" }}>
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>{t("nav.myOrders")}</h1>
          <p style={{ color: "var(--pp-muted)", fontSize: 13.5 }}>
            {orders.length} {t("dash.orderCountSuffix")} • {t("dash.totalEarningLabel")} {formatPKR(totalPayout)}
          </p>
        </div>
      </div>

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">{t("dash.noOrdersReceived")}</div>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>{t("dash.table.orderNum")}</th>
              <th>{t("dash.table.item")}</th>
              <th>{t("dash.table.buyer")}</th>
              <th>{t("cart.total")}</th>
              <th>{t("dash.table.commission")}</th>
              <th>{t("dash.table.yourPayout")}</th>
              <th>{t("dash.table.status")}</th>
              <th>{t("dash.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const action = NEXT_ACTION[o.status];
              return (
                <tr key={o._id}>
                  <td>{o.orderNumber}</td>
                  <td>{o.listingTitleSnapshot} (x{o.quantity})</td>
                  <td>
                    {o.buyer?.firstName} {o.buyer?.lastName}
                    <div style={{ fontSize: 11, color: "var(--pp-muted)" }}>{o.buyer?.phone}</div>
                  </td>
                  <td>{formatPKR(o.totalAmount)}</td>
                  <td>
                    {formatPKR(o.commissionAmount)}
                    {o.commissionType === "percent" && o.commissionPercent != null ? ` (${o.commissionPercent}%)` : ` ${t("dash.fixedLabel")}`}
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--pp-green-dark)" }}>{formatPKR(o.sellerPayout)}</td>
                  <td>{STATUS_LABELS[o.status]}</td>
                  <td>
                    {action && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "6px 12px", fontSize: 12, marginRight: 6 }}
                        disabled={busyId === o._id}
                        onClick={() => handleUpdate(o, action.next)}
                      >
                        {action.label}
                      </button>
                    )}
                    {["pending", "confirmed"].includes(o.status) && (
                      <button
                        className="icon-btn"
                        disabled={busyId === o._id}
                        onClick={() => handleUpdate(o, "cancelled")}
                        title={t("dash.cancel")}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SellerOrders;
