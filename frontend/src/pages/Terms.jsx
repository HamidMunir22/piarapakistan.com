import React from "react";
import { useLanguage } from "../context/LanguageContext.jsx";

// Editable placeholder — the owner can replace/extend any section below later
// (e.g. dispute resolution, refund policy specifics, governing law) without
// touching any other part of the app.
// NOTE: only the headings + "last updated" label are run through t() — the
// legal body paragraphs are intentionally left in English (translating dozens
// of legal-boilerplate paragraphs accurately is a separate, larger effort;
// headings translated keeps the page scannable in Urdu).
const Terms = () => {
  const { t } = useLanguage();
  return (
    <div className="container legal-page" style={{ padding: "48px 20px 80px" }}>
      <h1>{t("terms.title")}</h1>
      <p className="legal-updated">
        {t("legal.lastUpdated")} {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <h2>{t("terms.h1")}</h2>
      <p>
        By creating an account or using PiaraPakistan ("the Platform"), you agree to these Terms &amp; Conditions.
        If you do not agree, please do not use the Platform.
      </p>

      <h2>{t("terms.h2")}</h2>
      <p>
        The Platform supports three account types: Buyers, Service Sellers, and Shop Owners. Buyers can browse and
        purchase without submitting identity documents. Service Sellers and Shop Owners must complete identity
        verification (CNIC, ID card front/back, and a live selfie holding their ID card) before they can list any
        service or product.
      </p>

      <h2>{t("terms.h3")}</h2>
      <p>
        New Service Seller and Shop Owner accounts are placed under review immediately after registration. This
        review is typically completed within 24 hours; you will receive an email and SMS notification the moment
        your account is approved or rejected, even if that happens sooner. Listing, ordering, or payout features
        remain locked until verification is approved.
      </p>

      <h2>{t("terms.h4")}</h2>
      <p>
        The Platform charges a commission on completed orders, set by the Platform administrator as either a
        percentage or a fixed PKR amount. The exact rate is visible to Sellers/Shops and Admin, but never shown to
        Buyers on their receipt.
      </p>

      <h2>{t("terms.h5")}</h2>
      <p>
        Users may not submit false identity documents, impersonate another person or business, list illegal or
        counterfeit goods/services, or attempt to defraud other users. Accounts found in violation may be
        suspended without refund.
      </p>

      <h2>{t("terms.h6")}</h2>
      <p>
        You are responsible for keeping your password confidential. For your protection, an account is temporarily
        locked for 30 minutes after 3 consecutive incorrect password attempts.
      </p>

      <h2>{t("terms.h7")}</h2>
      <p>
        Orders may be paid via Cash on Delivery or Online Payment (JazzCash, Easypaisa, or supported bank
        transfer). Sellers/Shops provide their own payout bank/wallet details in their profile.
      </p>

      <h2>{t("terms.h8")}</h2>
      <p>
        PiaraPakistan acts as a marketplace connecting Buyers and Sellers/Shops. We are not a party to the
        underlying sale/service agreement and are not liable for the quality, safety, or legality of listed
        items/services, except as required by applicable law.
      </p>

      <h2>{t("terms.h9")}</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Platform after changes are posted
        constitutes acceptance of the revised Terms. This section, and any of the sections above, can be updated
        or expanded further as our policies evolve.
      </p>

      <h2>{t("terms.h10")}</h2>
      <p>Questions about these Terms can be sent to services@piarapakistan.com.</p>
    </div>
  );
};

export default Terms;
