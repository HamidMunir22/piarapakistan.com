import React from "react";
import { useLanguage } from "../context/LanguageContext.jsx";

// ---------------------------------------------------------------------------
// Shared password rule + strength meter, used on Register and Reset Password.
// Mirrors the backend's isStrongPassword() exactly (backend/controllers/
// authController.js) so what the user sees as "green" is guaranteed to be
// accepted by the server — no surprise rejections after a strong-looking bar.
// ---------------------------------------------------------------------------
export const evaluatePassword = (password = "") => {
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/\\;']/.test(password),
  };
  const passed = Object.values(rules).filter(Boolean).length;

  let level = "empty";
  if (password.length > 0) {
    if (passed <= 2) level = "weak";
    else if (passed <= 4) level = "medium";
    else level = "strong"; // all 5 rules met
  }

  return { rules, passed, level, isStrong: level === "strong" };
};

const PasswordStrength = ({ password }) => {
  const { t } = useLanguage();
  const LABELS = { empty: "", weak: t("auth.password.weak"), medium: t("auth.password.medium"), strong: t("auth.password.strong") };
  const { rules, level } = evaluatePassword(password);
  if (!password) return null;

  return (
    <div className="pw-strength">
      <div className={`pw-strength-track pw-strength-${level}`}>
        <div className={`pw-strength-fill pw-strength-fill-${level}`} />
      </div>
      <div className="pw-strength-row">
        <span className={`pw-strength-label pw-strength-label-${level}`}>{LABELS[level]}</span>
        <span className="pw-strength-rules">
          {[
            [t("auth.password.charsHint"), rules.length],
            ["A-Z", rules.upper],
            ["a-z", rules.lower],
            ["0-9", rules.number],
            ["@#$%", rules.special],
          ].map(([label, ok]) => (
            <span key={label} className={`pw-rule-chip ${ok ? "pw-rule-ok" : ""}`}>
              {label}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

export default PasswordStrength;
