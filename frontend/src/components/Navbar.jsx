import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search as SearchIcon, ShoppingCart, ClipboardList, MessageCircle, Languages } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { useChat } from "../context/ChatContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { t, language, toggleLanguage } = useLanguage();
  const { totalUnread } = useChat();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  const isSellerOrShop = user?.role === "seller" || user?.role === "shop";
  const isAdmin = user?.role === "admin";

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src="/logo.png" alt="PiaraPakistan" />
        <span>
          <span className="brand-orange">Piara</span>
          <span className="brand-green">Pakistan</span>
        </span>
      </Link>

      <div className="navbar-links">
        <Link to="/">{t("nav.home")}</Link>
        <Link to="/categories">{t("nav.categories")}</Link>
        {isSellerOrShop && (
          <>
            <Link to="/dashboard/listings">{t("nav.dashboard")}</Link>
            <Link to="/dashboard/orders">{t("nav.orders")}</Link>
          </>
        )}
        {isAdmin && <Link to="/admin">{t("nav.adminPanel")}</Link>}
        <Link to="/about">{t("nav.about")}</Link>
        <Link to="/contact">{t("nav.help")}</Link>
      </div>

      <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("nav.searchPlaceholder")}
          style={{
            padding: "9px 12px",
            borderRadius: 999,
            border: "1.5px solid var(--pp-border)",
            fontSize: 13,
            width: 200,
            background: "var(--pp-cream)",
          }}
        />
        <button type="submit" className="icon-btn" aria-label="Search">
          <SearchIcon size={18} />
        </button>
      </form>

      <div className="navbar-actions">
        <button className="icon-btn" title={language === "en" ? "اردو" : "English"} onClick={toggleLanguage}>
          <Languages size={18} />
          <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 3 }}>{language === "en" ? "UR" : "EN"}</span>
        </button>

        {user && (
          <Link to="/messages" className="icon-btn" title={t("chat.title")} style={{ position: "relative" }}>
            <MessageCircle size={19} />
            {totalUnread > 0 && <span className="navbar-badge">{totalUnread}</span>}
          </Link>
        )}

        {user && !isSellerOrShop && (
          <Link to="/orders" className="icon-btn" title={t("nav.myOrders")} style={{ position: "relative" }}>
            <ClipboardList size={19} />
          </Link>
        )}
        <Link to="/cart" className="icon-btn" title={t("nav.cart")} style={{ position: "relative" }}>
          <ShoppingCart size={19} />
          {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
        </Link>

        {user ? (
          <>
            <span style={{ fontSize: 13, color: "var(--pp-muted)" }}>
              {user.firstName} ({user.role})
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              {t("nav.logout")}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">
              {t("nav.login")}
            </Link>
            <Link to="/register" className="btn btn-primary">
              {t("nav.register")}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
