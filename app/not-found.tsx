"use client";

import Link from "next/link";
import { FileQuestion, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/global/language-switcher";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark text-white">
              <Shield className="size-4" />
            </div>
            <span className="font-semibold tracking-tight text-foreground">
              {t("header.brand")}
            </span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <p className="text-sm font-medium tabular-nums text-muted-foreground">
            {t("notFound.code")}
          </p>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/15">
            <FileQuestion className="size-8 text-brand-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {t("notFound.title")}
            </h1>
            <p className="text-muted-foreground">{t("notFound.description")}</p>
          </div>
          <Button
            asChild
            className="bg-brand-dark text-white hover:bg-brand-dark/90 hover:text-white"
          >
            <Link href="/">{t("notFound.goToHomepage")}</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            <Link
              href="/legal/privacy-policy"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {t("footer.privacyPolicy")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
