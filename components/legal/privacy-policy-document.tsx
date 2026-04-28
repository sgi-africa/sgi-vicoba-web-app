"use client"

import { PRIVACY_POLICY_COMPANY, PRIVACY_POLICY_SECTIONS } from "@/content/privacy-policy"
import { cn } from "@/lib/utils"
import { PolicyBlock } from "@/interfaces/interface"
import { useTranslation } from "react-i18next"

/** Aligns with long-form / card body text on `app/page.tsx` (e.g. pricing notes, cards) */
const proseBody = "text-sm leading-relaxed text-foreground/90"

function Block({ block, className }: { block: PolicyBlock; className?: string }) {
  const { t } = useTranslation()
  if (block.type === "p") {
    return <p className={cn(proseBody, className)}>{block.text}</p>
  }
  if (block.type === "ul") {
    return (
      <ul
        className={cn(
          "list-inside list-disc space-y-2 pl-0.5 text-sm leading-relaxed text-foreground/90 marker:text-primary",
          className
        )}
      >
        {block.items.map((item) => (
          <li key={item} className="pl-1">
            {item}
          </li>
        ))}
      </ul>
    )
  }
  if (block.type === "note") {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/50 bg-background px-5 py-4 text-sm leading-relaxed text-muted-foreground",
          className
        )}
        role="note"
      >
        {block.text}
      </div>
    )
  }
  if (block.type === "contactList") {
    return (
      <ul className={cn("list-none space-y-3", className)}>
        {block.lines.map((line, i) => (
          <li
            key={i}
            className={cn(
              proseBody,
              "flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2"
            )}
          >
            {line.variant === "text" ? (
              line.text
            ) : (
              <>
                <span className="shrink-0 font-medium text-foreground">
                  {t(`legal.contact.${line.contactLabel}`)}:
                </span>
                <a
                  href={line.href}
                  className="font-medium text-primary underline-offset-2 transition-colors hover:text-primary/85 hover:underline"
                  {...(line.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {line.linkText}
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
    )
  }
  return null
}

export function PrivacyPolicyDocument() {
  const { t } = useTranslation()
  return (
    <div className="space-y-10 sm:space-y-12">
      <div className="space-y-3 border-b border-border/40 pb-8">
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          {t("legal.introChip", { company: PRIVACY_POLICY_COMPANY })}
        </span>
        <p className="text-sm text-muted-foreground leading-relaxed">{t("legal.introBody")}</p>
      </div>

      {PRIVACY_POLICY_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {section.title}
          </h2>
          {section.subsections ? (
            <div className="mt-5 space-y-8 sm:mt-6">
              {section.subsections.map((sub) => (
                <div key={sub.id} className="space-y-3 pl-0 sm:pl-1">
                  <h3 className="text-base font-semibold text-foreground">{sub.title}</h3>
                  <div className="space-y-3">
                    {sub.blocks.map((block, i) => (
                      <Block key={i} block={block} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 space-y-3 sm:mt-6">
              {section.blocks?.map((block, i) => <Block key={i} block={block} />)}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
