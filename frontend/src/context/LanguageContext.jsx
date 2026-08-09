import React, { createContext, useContext, useEffect, useState } from "react";
import translations from "../i18n/translations.js";

const LanguageContext = createContext(null);
const STORAGE_KEY = "pp_language";

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem(STORAGE_KEY) || "en");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
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
