import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search as SearchIcon, ShoppingCart, ClipboardList, MessageCircle, Languages, Menu, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setMobileOpen(false);
    navigate(`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  const isSellerOrShop = user?.role === "seller" || user?.role === "shop";
  const isAdmin = user?.role === "admin";
  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMobile}>
        <img src="/logo.png" alt="PiaraPakistan" />
        <span>
          <span className="brand-orange">Piara</span>
          <span className="brand-green">Pakistan</span>
        </span>
      </Link>

      {/* ---- Desktop nav links ---- */}
      <div className="navbar-links navbar-links-desktop">
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
        <Link to="/contact">{t("nav.contact")}</Link>
        <Link to="/help">{t("nav.help")}</Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="navbar-search-desktop">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("nav.searchPlaceholder")}
        />
        <button type="submit" className="icon-btn" aria-label="Search">
          <SearchIcon size={18} />
        </button>
      </form>

      <div className="navbar-actions navbar-actions-desktop">
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

      {/* ---- Mobile: cart + hamburger only, everything else moves into the slide-down panel ---- */}
      <div className="navbar-mobile-actions">
        <Link to="/cart" className="icon-btn" title={t("nav.cart")} style={{ position: "relative" }} onClick={closeMobile}>
          <ShoppingCart size={19} />
          {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
        </Link>
        <button
          className="icon-btn navbar-hamburger"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ---- Mobile slide-down panel (does NOT overlap page content — it's part of the layout flow) ---- */}
      {mobileOpen && (
        <div className="navbar-mobile-panel">
          <form onSubmit={handleSearchSubmit} className="navbar-search-mobile">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("nav.searchPlaceholder")}
            />
            <button type="submit" className="icon-btn" aria-label="Search">
              <SearchIcon size={18} />
            </button>
          </form>

          <Link to="/" onClick={closeMobile}>{t("nav.home")}</Link>
          <Link to="/categories" onClick={closeMobile}>{t("nav.categories")}</Link>
          {isSellerOrShop && (
            <>
              <Link to="/dashboard/listings" onClick={closeMobile}>{t("nav.dashboard")}</Link>
              <Link to="/dashboard/orders" onClick={closeMobile}>{t("nav.orders")}</Link>
            </>
          )}
          {isAdmin && <Link to="/admin" onClick={closeMobile}>{t("nav.adminPanel")}</Link>}
          {user && (
            <Link to="/messages" onClick={closeMobile}>
              {t("chat.title")} {totalUnread > 0 && `(${totalUnread})`}
            </Link>
          )}
          {user && !isSellerOrShop && (
            <Link to="/orders" onClick={closeMobile}>{t("nav.myOrders")}</Link>
          )}
          <Link to="/about" onClick={closeMobile}>{t("nav.about")}</Link>
          <Link to="/contact" onClick={closeMobile}>{t("nav.contact")}</Link>
          <Link to="/help" onClick={closeMobile}>{t("nav.help")}</Link>

          <button className="navbar-mobile-lang" onClick={toggleLanguage}>
            <Languages size={16} /> {language === "en" ? "اردو میں دیکھیں" : "View in English"}
          </button>

          <div className="navbar-mobile-auth">
            {user ? (
              <button
                className="btn btn-secondary btn-block"
                onClick={() => {
                  logout();
                  closeMobile();
                  navigate("/");
                }}
              >
                {t("nav.logout")}
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-block" onClick={closeMobile}>
                  {t("nav.login")}
                </Link>
                <Link to="/register" className="btn btn-primary btn-block" onClick={closeMobile}>
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
