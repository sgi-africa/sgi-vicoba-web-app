"use client"

import Link from "next/link"
import Image from "next/image"
import LanguageSwitcher from "@/components/global/language-switcher"
import { useTranslation } from "react-i18next"

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-14 shrink-0 w-full items-center justify-between gap-3 border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/sgi.svg"
            alt={t("header.brand")}
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
          />
          <span className="font-semibold text-foreground tracking-tight text-lg truncate">
            {t("header.brand")}
          </span>
        </Link>
        <LanguageSwitcher />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm space-y-6">{children}</div>
      </div>
    </div>
  )
}
