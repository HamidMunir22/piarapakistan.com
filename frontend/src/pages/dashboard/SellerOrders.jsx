import React, { useEffect, useState } from "react";
import { fetchSellerOrders, updateOrderStatus } from "../../api/orders";
import { formatPKR } from "../../utils/format.js";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirm ho gaya",
  in_progress: "Jaari hai",
  completed: "Mukammal",
  cancelled: "Cancel ho gaya",
};

const NEXT_ACTION = {
  pending: { next: "confirmed", label: "Confirm Karein" },
  confirmed: { next: "in_progress", label: "Shuru Karein" },
  in_progress: { next: "completed", label: "Mukammal Karein" },
};

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

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
      await updateOrderStatus(order._id, status, status === "cancelled" ? "Seller ne cancel kiya" : undefined);
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
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Mere Orders</h1>
          <p style={{ color: "var(--pp-muted)", fontSize: 13.5 }}>
            {orders.length} order(s) • Total earning (completed): {formatPKR(totalPayout)}
          </p>
        </div>
      </div>

      {loading ? (
        <p>Load ho raha hai...</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">Abhi tak koi order nahi aya.</div>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Item</th>
              <th>Buyer</th>
              <th>Total</th>
              <th>Commission</th>
              <th>Aapka Payout</th>
              <th>Status</th>
              <th>Action</th>
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
                    {o.commissionType === "percent" && o.commissionPercent != null ? ` (${o.commissionPercent}%)` : " (Fixed)"}
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
                        title="Cancel"
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
