import React, { createContext, useState, useEffect, useMemo } from "react";

// This line fixes the Vite Fast Refresh error you had
// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext(null);
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("preferredLanguage") || "en";
  });
  const changeLanguage = (code) => {
    setLanguage(code);
    localStorage.setItem("preferredLanguage", code);
    const googleCombo = document.querySelector(".goog-te-combo");
    if (googleCombo) {
      googleCombo.value = code;
      googleCombo.dispatchEvent(new Event("change"));
    }
  };

  useEffect(() => {
    // FIX: Clear Google's "auto-switch" cookies so it doesn't jump to Amharic
    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    const applyLanguage = () => {
      const googleCombo = document.querySelector(".goog-te-combo");
      if (googleCombo) {
        // Only trigger if the google combo isn't already set to our language
        if (googleCombo.value !== language) {
          googleCombo.value = language;
          googleCombo.dispatchEvent(new Event("change"));
        }
      }
    };
    // Give the Google script 1 second to load before forcing the language
    const timer = setTimeout(applyLanguage, 1000);
    return () => clearTimeout(timer);
  }, [language]);

  const value = useMemo(() => ({ language, changeLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
