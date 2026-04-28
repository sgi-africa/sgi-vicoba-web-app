"use client"

import { useCallback, useEffect, useState } from "react"
import { Banknote, Info, Wallet } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { mergeGroupFields } from "@/store/groupSlice"
import { PageHeader } from "@/components/shared/page-header"
import { SummaryCard, SummaryCardSkeleton } from "@/components/shared/summary-card"
import { EmptyState } from "@/components/shared/empty-state"
import { ContentContainer } from "@/components/shared/content-container"
import { formatAmount } from "@/utils/global/formatAmount"
import { formatDate } from "@/utils/global/formatDate"
import { ProfitSnapshot } from "@/interfaces/interface"
import { getLoans } from "@/app/home/loans/_action"
import { getPenalties } from "@/app/home/penalties/_action"
import { sumPaidPenaltiesAmount } from "@/utils/home/penalties"
import { sumLoanRepaymentsWithPaidAt } from "@/utils/home/loanRepay"
import { disburseGroupFunds, getDisbursementSnapshots } from "@/app/home/funds/_action"
import { getGroup } from "@/app/home/settings/_action"
import { disburseErrorMessage } from "@/utils/funds/fundDisburseError"

function isDisbursementCompletedStatus(group: { disbursementStatus?: string | null } | null): boolean {
  const s = group?.disbursementStatus?.trim().toUpperCase()
  return s === "COMPLETED" || s === "COMPLETE"
}

export default function FundsPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const [availableCash, setAvailableCash] = useState(0)
  const [loadingCash, setLoadingCash] = useState(true)
  const [disbursements, setDisbursements] = useState<ProfitSnapshot[]>([])
  const [loadingSnapshots, setLoadingSnapshots] = useState(true)
  const [disbursePending, setDisbursePending] = useState(false)

  const groupId = activeGroup?.id

  const refreshSnapshots = useCallback(async () => {
    if (!groupId) {
      setDisbursements([])
      setLoadingSnapshots(false)
      return
    }
    setLoadingSnapshots(true)
    try {
      const rows = await getDisbursementSnapshots(groupId)
      setDisbursements(rows)
    } catch {
      setDisbursements([])
    } finally {
      setLoadingSnapshots(false)
    }
  }, [groupId])

  const refreshAvailableCash = useCallback(async () => {
    if (!groupId) {
      setAvailableCash(0)
      setLoadingCash(false)
      return
    }
    setLoadingCash(true)
    try {
      const [loans, penalties] = await Promise.all([
        getLoans(groupId),
        getPenalties(groupId),
      ])
      setAvailableCash(
        sumPaidPenaltiesAmount(penalties) + sumLoanRepaymentsWithPaidAt(loans)
      )
    } catch {
      setAvailableCash(0)
    } finally {
      setLoadingCash(false)
    }
  }, [groupId])

  useEffect(() => {
    void refreshAvailableCash()
  }, [refreshAvailableCash])

  useEffect(() => {
    void refreshSnapshots()
  }, [refreshSnapshots])

  const refreshGroupFromApi = useCallback(async () => {
    if (!groupId) return
    const g = await getGroup(groupId)
    if (g) {
      dispatch(mergeGroupFields({ groupId, patch: g }))
    }
  }, [groupId, dispatch])

  useEffect(() => {
    void refreshGroupFromApi()
  }, [refreshGroupFromApi])

  const totalDisbursed = disbursements.reduce(
    (sum, d) => sum + Number(d.totalProfit ?? 0),
    0
  )
  const hasFunds = availableCash > 0
  const hasDisbursements = disbursements.length > 0

  const loadingSummary = loadingCash || loadingSnapshots
  const disbursementCompleted = activeGroup ? isDisbursementCompletedStatus(activeGroup) : false

  async function handleDisburse() {
    if (!groupId || disbursementCompleted) return
    setDisbursePending(true)
    try {
      await disburseGroupFunds(groupId)
      toast.success(t("notifications.disbursementRecorded"))
      await Promise.all([
        refreshSnapshots(),
        refreshAvailableCash(),
        refreshGroupFromApi(),
      ])
    } catch (err) {
      toast.error(disburseErrorMessage(err, t("notifications.disbursementFailed")))
    } finally {
      setDisbursePending(false)
    }
  }

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
          label:
            disbursements.length === 1 ? t("common.disbursement") : t("common.disbursements"),
        })}
      >
        <Button
          size="sm"
          className="gap-2"
          disabled={disbursePending || loadingSummary || disbursementCompleted}
          title={
            disbursementCompleted ? t("funds.disbursementCompletedHint") : undefined
          }
          onClick={() => void handleDisburse()}
        >
          <Banknote className="size-4" />
          {t("funds.runDisbursement")}
        </Button>
      </PageHeader>

      <ContentContainer>
        {disbursementCompleted && (
          <div
            className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-950 dark:text-emerald-50 mb-6"
            role="status"
          >
            {t("funds.disbursementCompletedHint")}
          </div>
        )}
        {/* Info banner */}
        <Card className="border-border/60 bg-muted/40 mb-6 shadow-none">
          <CardContent className="flex items-start gap-3 py-3">
            <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1.5 marker:text-muted-foreground min-w-0">
              <li>{t("funds.disburseBannerShares")}</li>
              <li>{t("funds.disburseBannerIrreversible")}</li>
              <li>{t("funds.disburseBannerTiming")}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {loadingSummary ? (
            <>
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </>
          ) : (
            <>
              <SummaryCard label={t("funds.availableBalance")} value={formatAmount(availableCash)} />
              <SummaryCard label={t("funds.totalDisbursed")} value={formatAmount(totalDisbursed)} />
            </>
          )}
        </div>

        {/* Main content */}
        {loadingSnapshots ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="shadow-sm border-border/60 overflow-hidden">
                <CardContent className="py-4 flex flex-col sm:flex-row gap-3 sm:items-center">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <Skeleton className="h-4 w-44 max-w-full" />
                      <Skeleton className="h-3 w-full max-w-md" />
                      <Skeleton className="h-3 w-36 max-w-full" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-24 shrink-0 sm:self-center self-end" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !hasFunds && !hasDisbursements ? (
          <EmptyState
            icon={Wallet}
            title={t("funds.noFundsAllocated")}
            description={t("funds.recordContributionsFirst")}
          />
        ) : !hasDisbursements ? (
          disbursementCompleted ? (
            <EmptyState
              icon={Banknote}
              title={t("funds.noDisbursementsYet")}
              description={t("funds.completedNoSnapshotHistory")}
            />
          ) : (
            <EmptyState
              icon={Banknote}
              title={t("funds.noDisbursementsYet")}
              description={t("funds.availableDisbursementInfo", {
                amount: formatAmount(availableCash),
              })}
            />
          )
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
                      <p className="font-medium text-foreground">{t("funds.profitWindow")}</p>
                      <div className="text-sm text-muted-foreground space-y-0.5 mt-1">
                        <p>{t("funds.startDateLine", { date: formatDate(d.profitWindowStart) })}</p>
                        <p>{t("funds.endDateLine", { date: formatDate(d.profitWindowEnd) })}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5">
                        {t("funds.disbursementDateLine", { date: formatDate(d.executedAt) })} ·{" "}
                        {t("funds.payoutSummary", {
                          count: d.payouts.length,
                          members: d.activeMemberCount,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-semibold text-foreground">{formatAmount(d.totalProfit)}</span>
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
