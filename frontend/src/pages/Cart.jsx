import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPKR } from "../utils/format.js";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>Cart khali hai</h2>
        <p style={{ color: "var(--pp-muted)", marginBottom: 20 }}>Kuch services ya products browse kar ke add karein.</p>
        <Link to="/search" className="btn btn-primary">Search Karein</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "36px 20px 60px", maxWidth: 760 }}>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Aapka Cart</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((item) => (
          <div
            key={item.listingId}
            className="auth-card"
            style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 10, overflow: "hidden", background: "var(--pp-cream)", flexShrink: 0 }}>
              {item.image ? (
                <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>📷</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{item.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--pp-muted)" }}>{item.sellerName}</div>
              <div style={{ fontWeight: 700, color: "var(--pp-green-dark)", marginTop: 4 }}>{formatPKR(item.price)}</div>
            </div>

            {item.listingType === "product" ? (
              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--pp-border)", borderRadius: 999 }}>
                <button className="icon-btn" onClick={() => updateQuantity(item.listingId, item.quantity - 1)}>
                  <Minus size={14} />
                </button>
                <span style={{ padding: "0 10px", fontWeight: 700 }}>{item.quantity}</span>
                <button className="icon-btn" onClick={() => updateQuantity(item.listingId, item.quantity + 1)}>
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <span style={{ fontSize: 12, color: "var(--pp-muted)" }}>Booking x{item.quantity}</span>
            )}

            <button className="icon-btn" onClick={() => removeFromCart(item.listingId)} title="Remove">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="auth-card" style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--pp-muted)" }}>Total</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--pp-green-dark)" }}>{formatPKR(cartTotal)}</div>
        </div>
        <button className="btn btn-primary" onClick={handleCheckout}>
          Checkout Karein
        </button>
      </div>
    </div>
  );
};

export default Cart;
