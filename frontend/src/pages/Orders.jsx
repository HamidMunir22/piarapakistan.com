import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchMyOrders, submitReview } from "../api/orders";
import { formatPKR } from "../utils/format.js";
import { Star, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

const STATUS_COLORS = {
  pending: "var(--pp-orange-dark)",
  confirmed: "var(--pp-green-dark)",
  in_progress: "var(--pp-green-dark)",
  completed: "var(--pp-green-dark)",
  cancelled: "var(--pp-danger)",
};

const ReviewForm = ({ order, onSubmitted }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitReview(order._id, rating, comment);
      onSubmitted(order._id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 12, padding: 14, background: "var(--pp-cream)", borderRadius: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t("orders.leaveReview")}</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={22}
            onClick={() => setRating(n)}
            fill={n <= rating ? "var(--pp-orange)" : "none"}
            color="var(--pp-orange)"
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>
      <textarea
        rows={2}
        placeholder={t("orders.reviewPlaceholder")}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? t("orders.submittingReview") : t("orders.submitReviewBtn")}
      </button>
    </div>
  );
};

const Orders = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const STATUS_LABELS = {
    pending: t("orders.status.pending"),
    confirmed: t("orders.status.confirmed"),
    in_progress: t("orders.status.inProgress"),
    completed: t("orders.status.completed"),
    cancelled: t("orders.status.cancelled"),
  };

  const load = () => {
    setLoading(true);
    fetchMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleReviewed = (orderId) => {
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, reviewed: true } : o)));
  };

  return (
    <div className="container" style={{ padding: "36px 20px 60px", maxWidth: 760 }}>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>{t("nav.myOrders")}</h1>
      {location.state?.justOrdered && (
        <div className="alert alert-success">
          <CheckCircle2 size={15} style={{ verticalAlign: -2 }} /> {t("orders.justOrderedMsg")}
        </div>
      )}

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">{t("orders.noOrders")}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          {orders.map((o) => (
            <div key={o._id} className="auth-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--pp-muted)" }}>{o.orderNumber}</div>
                  <div style={{ fontWeight: 700, fontSize: 15.5 }}>{o.listingTitleSnapshot}</div>
                  <div style={{ fontSize: 12.5, color: "var(--pp-muted)", marginTop: 2 }}>
                    {o.seller?.businessName || `${o.seller?.firstName || ""} ${o.seller?.lastName || ""}`} • {t("orders.qtyLabel")} {o.quantity}
                  </div>
                </div>
                <span style={{ fontWeight: 700, fontSize: 13, color: STATUS_COLORS[o.status] }}>
                  {STATUS_LABELS[o.status]}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 13.5 }}>
                <span style={{ color: "var(--pp-muted)" }}>
                  {o.paymentMethod === "cod" ? t("checkout.cod") : t("orders.onlineLabel")} • {new Date(o.createdAt).toLocaleDateString("en-PK")}
                </span>
                <span style={{ fontWeight: 800, color: "var(--pp-green-dark)" }}>{formatPKR(o.totalAmount)}</span>
              </div>

              {o.status === "completed" && !o.reviewed && (
                <ReviewForm order={o} onSubmitted={handleReviewed} />
              )}
              {o.status === "completed" && o.reviewed && (
                <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--pp-green-dark)" }}>
                  ✓ {t("orders.reviewedMsg")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
