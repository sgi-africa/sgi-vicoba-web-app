"use client"

import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    <div className="flex items-center rounded-md border border-border/60 bg-card p-0.5">
      {(["en", "sw"] as const).map((lang) => (
        <Button
          key={lang}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => changeLanguage(lang)}
          className={cn(
            "h-6 px-2.5 text-xs font-medium rounded-sm transition-colors",
            currentLang === lang
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-transparent"
          )}
        >
          {lang.toUpperCase()}
        </Button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
