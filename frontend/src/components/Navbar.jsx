import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Search as SearchIcon, ShoppingCart, ClipboardList, MessageCircle, Languages, Menu, X, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useLanguage, LANGUAGES } from "../context/LanguageContext.jsx";
import { useChat } from "../context/ChatContext.jsx";

// Small dropdown listing every selectable language (currently English +
// Urdu). Built to scale — adding a language to LANGUAGES in
// LanguageContext.jsx is the only change needed for it to show up here too.
const LanguageMenu = ({ className = "" }) => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className={`lang-menu ${className}`}>
      <button className="icon-btn lang-menu-trigger" onClick={() => setOpen((o) => !o)} type="button">
        <Languages size={18} />
        <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 3 }}>{current.code.toUpperCase()}</span>
      </button>
      {open && (
        <>
          <div className="lang-menu-backdrop" onClick={() => setOpen(false)} />
          <div className="lang-menu-list">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                className={`lang-menu-item ${l.code === language ? "active" : ""}`}
                onClick={() => {
                  setLanguage(l.code);
                  setOpen(false);
                }}
                type="button"
              >
                {l.label}
                {l.code === language && <Check size={15} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { t } = useLanguage();
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
  const navLinkClass = ({ isActive }) => (isActive ? "active" : "");

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
        <NavLink to="/" end className={navLinkClass}>{t("nav.home")}</NavLink>
        <NavLink to="/categories" className={navLinkClass}>{t("nav.categories")}</NavLink>
        {isSellerOrShop && (
          <>
            <NavLink to="/dashboard/listings" className={navLinkClass}>{t("nav.dashboard")}</NavLink>
            <NavLink to="/dashboard/orders" className={navLinkClass}>{t("nav.orders")}</NavLink>
          </>
        )}
        {isAdmin && <NavLink to="/admin" className={navLinkClass}>{t("nav.adminPanel")}</NavLink>}
        <NavLink to="/about" className={navLinkClass}>{t("nav.about")}</NavLink>
        <NavLink to="/contact" className={navLinkClass}>{t("nav.contact")}</NavLink>
        <NavLink to="/help" className={navLinkClass}>{t("nav.help")}</NavLink>
      </div>

      <form onSubmit={handleSearchSubmit} className="navbar-search-desktop">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("nav.searchPlaceholder")}
        />
        <button type="submit" className="icon-btn" aria-label={t("nav.searchAriaLabel")}>
          <SearchIcon size={18} />
        </button>
      </form>

      <div className="navbar-actions navbar-actions-desktop">
        <LanguageMenu />

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
          aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
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
            <button type="submit" className="icon-btn" aria-label={t("nav.searchAriaLabel")}>
              <SearchIcon size={18} />
            </button>
          </form>

          <NavLink to="/" end className={navLinkClass} onClick={closeMobile}>{t("nav.home")}</NavLink>
          <NavLink to="/categories" className={navLinkClass} onClick={closeMobile}>{t("nav.categories")}</NavLink>
          {isSellerOrShop && (
            <>
              <NavLink to="/dashboard/listings" className={navLinkClass} onClick={closeMobile}>{t("nav.dashboard")}</NavLink>
              <NavLink to="/dashboard/orders" className={navLinkClass} onClick={closeMobile}>{t("nav.orders")}</NavLink>
            </>
          )}
          {isAdmin && <NavLink to="/admin" className={navLinkClass} onClick={closeMobile}>{t("nav.adminPanel")}</NavLink>}
          {user && (
            <NavLink to="/messages" className={navLinkClass} onClick={closeMobile}>
              {t("chat.title")} {totalUnread > 0 && `(${totalUnread})`}
            </NavLink>
          )}
          {user && !isSellerOrShop && (
            <NavLink to="/orders" className={navLinkClass} onClick={closeMobile}>{t("nav.myOrders")}</NavLink>
          )}
          <NavLink to="/about" className={navLinkClass} onClick={closeMobile}>{t("nav.about")}</NavLink>
          <NavLink to="/contact" className={navLinkClass} onClick={closeMobile}>{t("nav.contact")}</NavLink>
          <NavLink to="/help" className={navLinkClass} onClick={closeMobile}>{t("nav.help")}</NavLink>

          <div className="navbar-mobile-lang-label">{t("nav.languageLabel")}</div>
          <div className="navbar-mobile-lang-options">
            {LANGUAGES.map((l) => (
              <MobileLangOption key={l.code} lang={l} />
            ))}
          </div>

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

// Small helper so the mobile language list can read/set language via context
// without prop-drilling from the parent.
const MobileLangOption = ({ lang }) => {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      className={`navbar-mobile-lang-option ${lang.code === language ? "active" : ""}`}
      onClick={() => setLanguage(lang.code)}
      type="button"
    >
      {lang.label}
      {lang.code === language && <Check size={14} />}
    </button>
  );
};

export default Navbar;
