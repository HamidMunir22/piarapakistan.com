import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { fileComplaint } from "../api/admin.js";
import { useLanguage } from "../context/LanguageContext.jsx";

// Proper "Contact Us" page — general contact info for everyone, with an
// optional message form for logged-in users (reuses the complaint/help
// pipeline on the backend so replies land in the same admin inbox as the
// Help Center). Distinct from /help, which is specifically for filing
// fraud/complaint reports and tracking their status.
const Contact = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({ subject: "", message: "", category: "other" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fileComplaint(form);
      setForm({ subject: "", message: "", category: "other" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <h1>{t("contact.title")}</h1>
          <p>{t("contact.subtitle")}</p>
        </div>
      </div>

      <div className="container contact-layout" style={{ padding: "48px 20px" }}>
        <div className="contact-info">
          <h2>{t("contact.getInTouch")}</h2>
          <div className="contact-info-item">
            <div className="contact-info-icon"><Mail size={18} /></div>
            <div>
              <b>{t("contact.emailLabel")}</b>
              <div>services@gmail.com</div>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon"><Phone size={18} /></div>
            <div>
              <b>{t("contact.phoneLabel")}</b>
              <div>+92 3XX XXXXXXX</div>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon"><MapPin size={18} /></div>
            <div>
              <b>{t("contact.locationLabel")}</b>
              <div>{t("contact.locationValue")}</div>
            </div>
          </div>
        </div>

        <div className="auth-card contact-form-card">
          <h2 style={{ marginTop: 0 }}>{t("contact.sendMessage")}</h2>
          {!user ? (
            <p style={{ color: "var(--pp-muted)" }}>
              {t("contact.loginPromptPre")}{" "}
              <Link to="/login" style={{ color: "var(--pp-orange-dark)", fontWeight: 700 }}>
                {t("contact.loginLinkText")}
              </Link>{" "}
              {t("contact.loginPromptPost")}
            </p>
          ) : (
            <>
              {success && <div className="alert alert-success">{t("contact.successMsg")}</div>}
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>{t("common.subject")}</label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                </div>
                <div className="field">
                  <label>{t("contact.messageLabel")}</label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <button className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? t("contact.sending") : t("contact.sendMessageBtn")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
