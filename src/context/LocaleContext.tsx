"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Locale = "EN" | "ES" | "CN" | "DE";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Simple dictionary for demonstration
const translations: Record<Locale, Record<string, string>> = {
  EN: {
    marketplace: "Marketplace",
    ai_lab: "AI Lab",
    search_placeholder: "Search intelligence...",
    verified: "Verified",
    testnet: "Stacks Testnet",
  },
  ES: {
    marketplace: "Mercado",
    ai_lab: "Lab de IA",
    search_placeholder: "Buscar inteligencia...",
    verified: "Verificado",
    testnet: "Testnet de Stacks",
  },
  CN: {
    marketplace: "市场",
    ai_lab: "人工智能实验室",
    search_placeholder: "搜索情报...",
    verified: "已验证",
    testnet: "Stacks 测试网",
  },
  DE: {
    marketplace: "Marktplatz",
    ai_lab: "KI-Labor",
    search_placeholder: "Intelligenz suchen...",
    verified: "Verifiziert",
    testnet: "Stacks Testnetz",
  },
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("EN");

  const t = (key: string) => {
    return translations[locale][key] || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
