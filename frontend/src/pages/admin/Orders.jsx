import React, { useEffect, useState } from "react";
import { fetchAdminOrders } from "../../api/admin.js";
import { formatPKR } from "../../utils/format.js";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirm ho gaya",
  in_progress: "Jaari hai",
  completed: "Mukammal",
  cancelled: "Cancel ho gaya",
};

const Orders = () => {
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
      <h1 style={{ fontSize: 24 }}>Orders</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 16 }}>{total} total orders</p>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--pp-border)", marginBottom: 18 }}
      >
        <option value="">Sab Status</option>
        {Object.entries(STATUS_LABELS).map(([k, label]) => (
          <option key={k} value={k}>{label}</option>
        ))}
      </select>

      {loading ? (
        <p>Load ho raha hai...</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Item</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Total</th>
              <th>Commission</th>
              <th>Status</th>
              <th>Date</th>
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
                  {o.commissionType === "percent" && o.commissionPercent != null ? ` (${o.commissionPercent}%)` : " (Fixed)"}
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
