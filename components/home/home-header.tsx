"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import LanguageSwitcher from "@/components/global/language-switcher"
import { useTranslation } from "react-i18next"

export function HomeHeader() {
  const { t } = useTranslation()
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 px-4 md:px-6">
      <SidebarTrigger />
      <h1 className="text-lg font-semibold truncate">{t("header.brand")}</h1>
      <div className="ml-auto">
        <LanguageSwitcher />
      </div>
    </header>
  )
}
