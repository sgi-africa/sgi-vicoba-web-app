"use client"

import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import en from "./en/translation.json"
import sw from "./sw/translation.json"

const getInitialLanguage = () => {
  if (typeof window === "undefined") return "en"
  return localStorage.getItem("lang") || "en"
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      sw: { translation: sw },
    },
    lng: getInitialLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })
}

// Sync language from localStorage on client (handles hydration)
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("lang")
  if (saved && saved !== i18n.language) {
    i18n.changeLanguage(saved)
  }
}

export default i18n