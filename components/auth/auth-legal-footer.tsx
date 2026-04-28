"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

export function AuthLegalFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useTranslation()
  return (
    <div className={cn("text-center", className)} {...props}>
      <Link
        href="/legal/privacy-policy"
        className="text-xs font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
      >
        {t("footer.privacyPolicy")}
      </Link>
    </div>
  )
}
