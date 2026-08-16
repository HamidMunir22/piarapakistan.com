import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

const Footer = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col footer-brand">
          <div className="navbar-brand" style={{ marginBottom: 10 }}>
            <img src="/logo.png" alt="PiaraPakistan" />
            <span>
              <span className="brand-orange">Piara</span>
              <span className="brand-green">Pakistan</span>
            </span>
          </div>
          <p>{t("footer.tagline")}</p>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <Facebook size={16} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <Youtube size={16} />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>{t("footer.quickLinks")}</h4>
          <Link to="/">{t("nav.home")}</Link>
          <Link to="/categories">{t("nav.categories")}</Link>
          <Link to="/search">{t("footer.browseListings")}</Link>
          <Link to="/about">{t("footer.aboutUs")}</Link>
        </div>

        <div className="footer-col">
          <h4>{t("footer.support")}</h4>
          <Link to="/contact">{t("contact.title")}</Link>
          <Link to="/help">{t("footer.helpCenter")}</Link>
          <Link to="/terms">{t("footer.terms")}</Link>
          <Link to="/privacy">{t("footer.privacy")}</Link>
        </div>

        <div className="footer-col">
          <h4>{t("contact.getInTouch")}</h4>
          <span className="footer-contact-line">
            <Mail size={14} /> services@piarapakistan.com
          </span>
          <span className="footer-contact-line">
            <MapPin size={14} /> {t("contact.locationValue")}
          </span>
        </div>
      </div>

      <div className="footer-bottom">
        © {year} {t("footer.rights")} &nbsp;|&nbsp; <Link to="/privacy">{t("footer.privacy")}</Link> &nbsp;|&nbsp;{" "}
        <Link to="/terms">{t("footer.terms")}</Link>
      </div>
    </footer>
  );
};

export default Footer;
