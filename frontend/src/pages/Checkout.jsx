import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { placeOrder } from "../api/orders";
import { initiatePayment } from "../api/payments";
import { formatPKR } from "../utils/format.js";

const Checkout = () => {
  const { items, cartTotal, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    deliveryAddress: user?.address || "",
    city: user?.city || "",
    notes: "",
    paymentMethod: "cod",
    provider: "jazzcash",
    mobileNumber: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitJazzCashForm = (actionUrl, fields) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = actionUrl;
    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1) Place one order per cart line item (existing flow)
    const createdOrderIds = [];
    const failures = [];
    for (const item of items) {
      try {
        const order = await placeOrder({
          listingId: item.listingId,
          quantity: item.quantity,
          paymentMethod: form.paymentMethod,
          deliveryAddress: form.deliveryAddress,
          city: form.city,
          notes: form.notes,
        });
        createdOrderIds.push(order._id);
        removeFromCart(item.listingId);
      } catch (err) {
        failures.push(`${item.title}: ${err.response?.data?.message || "order fail hui"}`);
      }
    }

    if (failures.length > 0) {
      setLoading(false);
      setError(failures.join(" • "));
      return;
    }

    // 2) Cash on Delivery -> done, go to orders
    if (form.paymentMethod === "cod") {
      setLoading(false);
      navigate("/orders", { state: { justOrdered: true } });
      return;
    }

    // 3) Online payment -> start a payment intent covering all the orders just created
    try {
      const result = await initiatePayment({
        orderIds: createdOrderIds,
        provider: form.provider,
        mobileNumber: form.provider === "easypaisa" ? form.mobileNumber : undefined,
      });

      if (result.mode === "mock") {
        navigate(`/payment/mock/${result.intentId}`);
      } else if (result.mode === "redirect") {
        submitJazzCashForm(result.actionUrl, result.fields); // browser navigates away to JazzCash
      } else if (result.mode === "easypaisa_ma") {
        navigate("/orders", { state: { justOrdered: true, easypaisaPending: true } });
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Payment shuru nahi ho saka");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>Cart khali hai</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "36px 20px 60px", maxWidth: 620 }}>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Checkout</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-card">
        <div className="section-label">Delivery Details</div>
        <div className="field">
          <label>Poora Address</label>
          <input
            value={form.deliveryAddress}
            onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>City</label>
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        </div>
        <div className="field">
          <label>Extra Notes (optional)</label>
          <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div className="section-label">Payment Method</div>
        <div className="field">
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
            <input
              type="radio"
              name="paymentMethod"
              checked={form.paymentMethod === "cod"}
              onChange={() => setForm({ ...form, paymentMethod: "cod" })}
            />
            Cash on Delivery
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, marginTop: 8 }}>
            <input
              type="radio"
              name="paymentMethod"
              checked={form.paymentMethod === "online"}
              onChange={() => setForm({ ...form, paymentMethod: "online" })}
            />
            Online Payment (JazzCash / Easypaisa)
          </label>
        </div>

        {form.paymentMethod === "online" && (
          <div style={{ background: "var(--pp-cream)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div className="field">
              <label>Provider</label>
              <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                  <input
                    type="radio"
                    name="provider"
                    checked={form.provider === "jazzcash"}
                    onChange={() => setForm({ ...form, provider: "jazzcash" })}
                  />
                  JazzCash
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                  <input
                    type="radio"
                    name="provider"
                    checked={form.provider === "easypaisa"}
                    onChange={() => setForm({ ...form, provider: "easypaisa" })}
                  />
                  Easypaisa
                </label>
              </div>
            </div>

            {form.provider === "easypaisa" && (
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Easypaisa Mobile Number</label>
                <input
                  value={form.mobileNumber}
                  onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                  placeholder="03XXXXXXXXX"
                  required={form.provider === "easypaisa"}
                />
              </div>
            )}

            <p style={{ fontSize: 11.5, color: "var(--pp-muted)", margin: "8px 0 0" }}>
              Agar platform ke real merchant credentials abhi configure nahi hain, to ye Test Mode mein
              chalega taake aap poora flow check kar sakein.
            </p>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", margin: "16px 0", fontSize: 16, fontWeight: 700 }}>
          <span>Total</span>
          <span style={{ color: "var(--pp-green-dark)" }}>{formatPKR(cartTotal)}</span>
        </div>

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Order place ho raha hai..." : "Order Confirm Karein"}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
