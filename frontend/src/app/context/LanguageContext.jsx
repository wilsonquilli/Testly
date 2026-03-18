"use client";
import { createContext, useContext, useState } from "react";
import { useEffect } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en"); 

  useEffect(() => {
  const saved = localStorage.getItem("lang");
  if (saved) setLanguage(saved);
}, []);

useEffect(() => {
  localStorage.setItem("lang", language);
}, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}