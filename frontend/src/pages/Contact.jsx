import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { fileComplaint } from "../api/admin.js";

// Proper "Contact Us" page — general contact info for everyone, with an
// optional message form for logged-in users (reuses the complaint/help
// pipeline on the backend so replies land in the same admin inbox as the
// Help Center). Distinct from /help, which is specifically for filing
// fraud/complaint reports and tracking their status.
const Contact = () => {
  const { user } = useAuth();
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
          <h1>Contact Us</h1>
          <p>We'd love to hear from you — questions, feedback, or partnership ideas.</p>
        </div>
      </div>

      <div className="container contact-layout" style={{ padding: "48px 20px" }}>
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <div className="contact-info-item">
            <div className="contact-info-icon"><Mail size={18} /></div>
            <div>
              <b>Email</b>
              <div>info@piarapakistan.com</div>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon"><Phone size={18} /></div>
            <div>
              <b>Phone</b>
              <div>+92 3XX XXXXXXX</div>
            </div>
          </div>
          <div className="contact-info-item">
            <div className="contact-info-icon"><MapPin size={18} /></div>
            <div>
              <b>Location</b>
              <div>Pakistan</div>
            </div>
          </div>
        </div>

        <div className="auth-card contact-form-card">
          <h2 style={{ marginTop: 0 }}>Send a Message</h2>
          {!user ? (
            <p style={{ color: "var(--pp-muted)" }}>
              Please <Link to="/login" style={{ color: "var(--pp-orange-dark)", fontWeight: 700 }}>login</Link> to send a
              message — this way our team can follow up with you directly.
            </p>
          ) : (
            <>
              {success && <div className="alert alert-success">Your message has been sent. We'll get back to you soon.</div>}
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Subject</label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Message</label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <button className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Message"}
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
