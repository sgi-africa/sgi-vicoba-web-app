"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import LanguageSwitcher from "@/components/global/language-switcher"


const GROUP_NAME = "SGI VICOBA"

export function HomeHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 px-4 md:px-6">
      <SidebarTrigger />
      <h1 className="text-lg font-semibold truncate">{GROUP_NAME}</h1>
      <div className="ml-auto">
        <LanguageSwitcher />
      </div>
    </header>
  )
}
