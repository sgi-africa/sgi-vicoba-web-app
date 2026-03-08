"use client"

import { useTranslation } from "react-i18next"

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLang = i18n?.language?.split("-")[0] || "en"

  const changeLanguage = (lng: string) => {
    if (!i18n?.changeLanguage) return
    i18n.changeLanguage(lng)
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lng)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`px-2.5 py-1 rounded text-sm transition-colors ${
          currentLang === "en"
            ? "font-semibold bg-primary/30 text-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => changeLanguage("sw")}
        className={`px-2.5 py-1 rounded text-sm transition-colors ${
          currentLang === "sw"
            ? "font-semibold bg-primary/30 text-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        SW
      </button>
    </div>
  )
}

export default LanguageSwitcher