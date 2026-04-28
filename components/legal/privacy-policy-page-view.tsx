"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { PrivacyPolicyDocument } from "@/components/legal/privacy-policy-document"
import {
  PRIVACY_POLICY_EFFECTIVE_DATE,
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_VERSION,
} from "@/content/privacy-policy"
import { formatPolicyDate } from "@/utils/privacy-policy/privacy-policy"
import LanguageSwitcher from "@/components/global/language-switcher"
import { useTranslation } from "react-i18next"

export function PrivacyPolicyPageView() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Image
              src="/sgi.svg"
              alt={t("header.brand")}
              width={48}
              height={48}
              className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
              priority
            />
            <span className="truncate font-semibold tracking-tight text-foreground">{t("header.brand")}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden text-xs font-medium uppercase tracking-wider text-muted-foreground sm:inline">
              {t("legal.navLabel")}
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <p className="text-sm text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium text-primary transition-colors hover:text-primary/80"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {t("legal.backToHome")}
          </Link>
        </p>

        <div className="mt-6 space-y-4 sm:mt-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              v{PRIVACY_POLICY_VERSION}
            </span>
            <span className="text-sm text-muted-foreground" suppressHydrationWarning>
              {t("legal.effectiveAsOf", {
                date: formatPolicyDate(PRIVACY_POLICY_EFFECTIVE_DATE),
              })}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("legal.pageTitle")}</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("legal.pageLead")}</p>
        </div>

        <div className="mt-8 rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:mt-10 sm:p-8">
          <PrivacyPolicyDocument />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground sm:mt-10" suppressHydrationWarning>
          {t("legal.documentFooter", {
            version: PRIVACY_POLICY_VERSION,
            date: formatPolicyDate(PRIVACY_POLICY_LAST_UPDATED),
          })}
        </p>
      </main>
    </div>
  )
}
