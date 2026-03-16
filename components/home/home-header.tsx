"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import LanguageSwitcher from "@/components/global/language-switcher"
import GroupSelector from "@/components/home/group-selector"
import { useTranslation } from "react-i18next"
import { useAppSelector } from "@/hooks/redux"

export function HomeHeader() {
  const { t } = useTranslation()
  const groups = useAppSelector((state) => state.group.groups)
  const hasGroups = groups.length > 0

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 px-4 md:px-6 lg:px-8">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <h1 className="text-sm font-medium text-foreground truncate hidden sm:block">
        {t("header.brand")}
      </h1>
      <div className="ml-auto flex items-center gap-3">
        {hasGroups && <GroupSelector groups={groups} />}
        <LanguageSwitcher />
      </div>
    </header>
  )
}
