"use client"

import { useState } from "react"
import { Banknote, Wallet } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { useAppSelector } from "@/hooks/redux"
import { PageHeader } from "@/components/shared/page-header"
import { SummaryCard } from "@/components/shared/summary-card"
import { EmptyState } from "@/components/shared/empty-state"
import { ContentContainer } from "@/components/shared/content-container"

function formatAmount(amount: number | string) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-TZ", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

interface FundDisbursement {
  id: number
  amount: string
  purpose: string
  recipient: string
  disbursedAt: string
  disbursedBy: string
}

export default function FundsPage() {
  const { t } = useTranslation()
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const [disbursements] = useState<FundDisbursement[]>([])

  const totalBalance = Number(activeGroup?.totalBalance ?? 0)
  const hasFunds = totalBalance > 0
  const hasDisbursements = disbursements.length > 0

  if (!activeGroup) {
    return (
      <ContentContainer className="pt-5">
        <EmptyState
          icon={Banknote}
          title={t("common.noGroupSelected")}
          description={t("common.selectGroupToViewFunds")}
        />
      </ContentContainer>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      <PageHeader
        title={t("funds.title")}
        description={t("funds.disbursementsRecorded", {
          count: disbursements.length,
          label: disbursements.length === 1 ? t("common.disbursement") : t("common.disbursements"),
        })}
      />

      <ContentContainer>
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <SummaryCard label={t("funds.availableBalance")} value={formatAmount(totalBalance)} />
          <SummaryCard
            label={t("funds.totalDisbursed")}
            value={formatAmount(disbursements.reduce((sum, d) => sum + Number(d.amount ?? 0), 0))}
          />
        </div>

        {/* Main content */}
        {!hasFunds && !hasDisbursements ? (
          <EmptyState
            icon={Wallet}
            title={t("funds.noFundsAllocated")}
            description={t("funds.recordContributionsFirst")}
          />
        ) : !hasDisbursements ? (
          <EmptyState
            icon={Banknote}
            title={t("funds.noDisbursementsYet")}
            description={t("funds.availableDisbursementInfo", { amount: formatAmount(totalBalance) })}
          />
        ) : (
          <div className="space-y-2">
            {disbursements.map((d) => (
              <Card
                key={d.id}
                className="shadow-sm border-border/60 transition-all hover:shadow-md hover:border-border"
              >
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Banknote className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{d.purpose}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("common.to")} {d.recipient}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {formatDate(d.disbursedAt)} · {t("common.by")} {d.disbursedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-semibold text-foreground">{formatAmount(d.amount)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ContentContainer>
    </div>
  )
}
