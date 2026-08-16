import React from "react";
import { useLanguage } from "../context/LanguageContext.jsx";

// Editable placeholder — extend with any additional data-handling disclosures
// (e.g. third-party payment processors, analytics) as the platform grows.
// NOTE: same approach as Terms.jsx — headings + "last updated" translated,
// long legal body paragraphs intentionally left in English for now.
const Privacy = () => {
  const { t } = useLanguage();
  return (
    <div className="container legal-page" style={{ padding: "48px 20px 80px" }}>
      <h1>{t("privacy.title")}</h1>
      <p className="legal-updated">
        {t("legal.lastUpdated")} {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <h2>{t("privacy.h1")}</h2>
      <p>
        We collect information you provide directly: name, email, phone number, address/city, and — for Service
        Sellers and Shop Owners only — CNIC number, ID card front/back images, and a selfie holding your ID card.
        Buyers are never required to submit identity documents.
      </p>

      <h2>{t("privacy.h2")}</h2>
      <p>
        Identity documents are used solely to verify Sellers/Shops and prevent fraud on the Platform. Address and
        location data are used to show nearby listings and enable delivery/service coordination. Contact details
        are used for OTP verification, order receipts, and account notifications (including verification
        approval/rejection).
      </p>

      <h2>{t("privacy.h3")}</h2>
      <p>
        ID card and selfie images are visible only to our admin verification team. They are never shown publicly
        or to other users, including buyers you transact with.
      </p>

      <h2>{t("privacy.h4")}</h2>
      <p>
        Passwords are hashed and never stored in plain text. We use rate limiting, brute-force login lockouts, and
        reCAPTCHA to protect accounts from automated abuse. Sensitive fields (CNIC, bank account number) are never
        returned in API responses to the client.
      </p>

      <h2>{t("privacy.h5")}</h2>
      <p>
        We do not sell your personal information. Limited data is shared with payment gateways (JazzCash,
        Easypaisa, or your chosen bank) solely to process transactions, and with SMS/email providers solely to
        deliver OTPs and notifications.
      </p>

      <h2>{t("privacy.h6")}</h2>
      <p>
        You can request account deletion or a copy of your data by contacting services@gmail.com. You can also
        switch the site language between English and Urdu at any time from the navigation bar.
      </p>

      <h2>{t("privacy.h7")}</h2>
      <p>
        This Privacy Policy may be updated periodically to reflect new features or legal requirements. This page
        can be extended with further clauses at any time.
      </p>

      <h2>{t("privacy.h8")}</h2>
      <p>Questions about this policy can be sent to services@gmail.com.</p>
    </div>
  );
};

export default Privacy;
