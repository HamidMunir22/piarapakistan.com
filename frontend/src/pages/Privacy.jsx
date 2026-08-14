import React from "react";

// Editable placeholder — extend with any additional data-handling disclosures
// (e.g. third-party payment processors, analytics) as the platform grows.
const Privacy = () => {
  return (
    <div className="container legal-page" style={{ padding: "48px 20px 80px" }}>
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect information you provide directly: name, email, phone number, address/city, and — for Service
        Sellers and Shop Owners only — CNIC number, ID card front/back images, and a selfie holding your ID card.
        Buyers are never required to submit identity documents.
      </p>

      <h2>2. Why We Collect It</h2>
      <p>
        Identity documents are used solely to verify Sellers/Shops and prevent fraud on the Platform. Address and
        location data are used to show nearby listings and enable delivery/service coordination. Contact details
        are used for OTP verification, order receipts, and account notifications (including verification
        approval/rejection).
      </p>

      <h2>3. Who Can See Your Documents</h2>
      <p>
        ID card and selfie images are visible only to our admin verification team. They are never shown publicly
        or to other users, including buyers you transact with.
      </p>

      <h2>4. Data Storage &amp; Security</h2>
      <p>
        Passwords are hashed and never stored in plain text. We use rate limiting, brute-force login lockouts, and
        reCAPTCHA to protect accounts from automated abuse. Sensitive fields (CNIC, bank account number) are never
        returned in API responses to the client.
      </p>

      <h2>5. Sharing of Information</h2>
      <p>
        We do not sell your personal information. Limited data is shared with payment gateways (JazzCash,
        Easypaisa, or your chosen bank) solely to process transactions, and with SMS/email providers solely to
        deliver OTPs and notifications.
      </p>

      <h2>6. Your Choices</h2>
      <p>
        You can request account deletion or a copy of your data by contacting info@piarapakistan.com. You can also
        switch the site language between English and Urdu at any time from the navigation bar.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        This Privacy Policy may be updated periodically to reflect new features or legal requirements. This page
        can be extended with further clauses at any time.
      </p>

      <h2>8. Contact</h2>
      <p>Questions about this policy can be sent to info@piarapakistan.com.</p>
    </div>
  );
};

export default Privacy;
