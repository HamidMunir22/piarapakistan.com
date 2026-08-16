import React, { createContext, useContext, useEffect, useState } from "react";
import translations from "../i18n/translations.js";

const LanguageContext = createContext(null);
const STORAGE_KEY = "pp_language";

// Single source of truth for which languages are selectable in the navbar
// dropdown. Adding a new language later is just: add its translations to
// i18n/translations.js, then add one entry here — the dropdown picks it up
// automatically, no other code changes needed.
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو (Urdu)" },
  { code: "pa", label: "پنجابی (Punjabi)" },
  { code: "ps", label: "پښتو (Pashto)" },
  { code: "sd", label: "سنڌي (Sindhi)" },
  { code: "skr", label: "سرائیکی (Saraiki)" },
  { code: "bal", label: "بلوچی (Balochi)" },
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem(STORAGE_KEY) || "en");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    // IMPORTANT: we intentionally do NOT flip the whole document to dir="rtl"
    // here. Only a handful of nav labels are actually translated to Urdu —
    // the rest of the site (form fields, buttons, paragraphs) stays in
    // English. Setting dir="rtl" on the whole page mirrors that untranslated
    // English content (reversed field order, "flipped" text flow), which is
    // the "text ulta ho jata hai" bug that was reported. Keeping dir="ltr"
    // always means Urdu words (rendered with the Nastaliq font) still shape
    // and display correctly wherever they appear — they just don't mirror
    // the entire page layout around them.
    document.documentElement.dir = "ltr";
  }, [language]);

  const toggleLanguage = () => setLanguage((prev) => (prev === "en" ? "ur" : "en"));

  // t("nav.home") -> looks up the key in the active language, falls back to
  // English, then to the raw key itself so missing translations never crash.
  const t = (key) => translations[language]?.[key] ?? translations.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
