import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, MapPin } from "lucide-react";

const Footer = () => {
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
          <p>Pakistan's trusted marketplace for services, shops, and everything in between — verified and secure.</p>
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
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/search">Browse Listings</Link>
          <Link to="/about">About Us</Link>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <Link to="/contact">Contact Us</Link>
          <Link to="/help">Help Center</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>

        <div className="footer-col">
          <h4>Get in Touch</h4>
          <span className="footer-contact-line">
            <Mail size={14} /> services@piarapakistan.com
          </span>
          <span className="footer-contact-line">
            <MapPin size={14} /> Pakistan
          </span>
        </div>
      </div>

      <div className="footer-bottom">
        © {year} PiaraPakistan. All rights reserved. &nbsp;|&nbsp; <Link to="/privacy">Privacy Policy</Link> &nbsp;|&nbsp;{" "}
        <Link to="/terms">Terms &amp; Conditions</Link>
      </div>
    </footer>
  );
};

export default Footer;
