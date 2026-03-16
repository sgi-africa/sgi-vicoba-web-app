'use client'

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Wallet, Users, HandCoins, ClipboardList, Download, TrendingUp, Landmark, PiggyBank, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateGroupDialog } from "./create-group-dialog"
import { GroupResponse } from "@/interfaces/interface"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { setGroups, addGroup, setActiveGroup } from "@/store/groupSlice"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { getContributions } from "@/app/home/contributions/_action"
import { getLoans } from "@/app/home/loans/_action"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { useTranslation } from "react-i18next"
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

const QUICK_ACTION_KEYS = [
  { key: "contributions", href: "/home/contributions", icon: Wallet, color: "bg-primary/10 text-primary" },
  { key: "loans", href: "/home/loans", icon: HandCoins, color: "bg-amber-500/10 text-amber-600" },
  { key: "meetings", href: "/home/meetings", icon: ClipboardList, color: "bg-blue-500/10 text-blue-600" },
  { key: "members", href: "/home/members", icon: Users, color: "bg-violet-500/10 text-violet-600" },
] as const

export default function GroupDashboard({ groups }: { groups: GroupResponse[] }) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const selectedGroup = useAppSelector((state) => state.group.activeGroup)
  const reduxGroups = useAppSelector((state) => state.group.groups)
  const [totalMemberSavings, setTotalMemberSavings] = useState<number>(0)
  const [outstandingLoansTotal, setOutstandingLoansTotal] = useState<number>(0)

  useEffect(() => {
    if (groups.length > 0) {
      dispatch(setGroups(groups))
    }
  }, [groups, dispatch])

  const effectiveGroups = groups.length > 0 ? groups : reduxGroups
  const hasGroups = effectiveGroups.length > 0
  const selectedGroupFromApi =
    selectedGroup && effectiveGroups.length > 0
      ? effectiveGroups.find((g) => g.id === selectedGroup.id) ?? effectiveGroups[0]
      : effectiveGroups[0] ?? null

  useEffect(() => {
    const list = groups.length > 0 ? groups : reduxGroups
    if (!selectedGroup && list.length > 0) {
      dispatch(setActiveGroup(list[0]))
    }
  }, [groups, reduxGroups, selectedGroup, dispatch])

  useEffect(() => {
    const groupId = selectedGroupFromApi?.id
    let cancelled = false

    void (async () => {
      if (!groupId) {
        if (!cancelled) setTotalMemberSavings(0)
        return
      }
      try {
        const contributions = await getContributions(groupId)
        if (cancelled) return
        const sum = contributions.reduce(
          (acc, c) => acc + Number(c.amount ?? 0),
          0
        )
        setTotalMemberSavings(sum)
      } catch {
        if (!cancelled) setTotalMemberSavings(0)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedGroupFromApi?.id])

  useEffect(() => {
    const groupId = selectedGroupFromApi?.id
    let cancelled = false

    void (async () => {
      if (!groupId) {
        if (!cancelled) setOutstandingLoansTotal(0)
        return
      }
      try {
        const loans = await getLoans(groupId)
        if (cancelled) return
        const total = loans
          .filter((loan) => loan.status === "PENDING" || loan.status === "OVERDUE")
          .reduce((sum, loan) => sum + Number(loan.principal ?? 0), 0)
        setOutstandingLoansTotal(total)
      } catch {
        if (!cancelled) setOutstandingLoansTotal(0)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedGroupFromApi?.id])

  function handleGroupCreated(createdGroup: GroupResponse) {
    dispatch(addGroup(createdGroup))
    dispatch(setActiveGroup(createdGroup))
  }

  function handleDownloadSummary() {
    if (!selectedGroupFromApi) return

    const doc = new jsPDF()
    const groupName = selectedGroupFromApi.name
    const date = new Date().toLocaleDateString("en-TZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    doc.setFontSize(18)
    doc.text(t("dashboard.title") + " Summary", 14, 20)
    doc.setFontSize(12)
    doc.text(groupName, 14, 28)
    doc.text(date, 14, 34)

    autoTable(doc, {
      startY: 42,
      head: [["Metric", "Value"]],
      body: [
        [t("dashboard.totalGroupAssets"), formatAmount(selectedGroupFromApi.totalBalance ?? 0)],
        [t("dashboard.availableCash"), formatAmount(selectedGroupFromApi.totalBalance ?? 0)],
        [t("dashboard.totalMemberSavings"), formatAmount(totalMemberSavings)],
        [t("dashboard.outstandingLoans"), formatAmount(outstandingLoansTotal)],
      ],
      theme: "striped",
    })

    doc.save(`${groupName.replace(/\s+/g, "-")}-dashboard-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      <PageHeader
        title={t("dashboard.title")}
      >
        {hasGroups && selectedGroupFromApi && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border/60"
            onClick={handleDownloadSummary}
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}
        <CreateGroupDialog
          variant="default"
          onSuccess={handleGroupCreated}
        />
      </PageHeader>

      <ContentContainer>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={TrendingUp}
            label={t("dashboard.totalGroupAssets")}
            value=""
          />
          <SummaryCard
            icon={Landmark}
            label={t("dashboard.availableCash")}
            value={formatAmount(selectedGroupFromApi?.totalBalance ?? 0)}
          />
          <SummaryCard
            icon={PiggyBank}
            label={t("dashboard.totalMemberSavings")}
            value={formatAmount(totalMemberSavings)}
          />
          <SummaryCard
            icon={AlertTriangle}
            label={t("dashboard.outstandingLoans")}
            value={formatAmount(outstandingLoansTotal)}
            iconClassName="bg-amber-500/10 text-amber-600"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            {t("dashboard.quickActions")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACTION_KEYS.map(({ key, href, icon: Icon, color }) => {
              const canNavigate = hasGroups && selectedGroupFromApi
              const card = (
                <Card
                  className={cn(
                    "w-full h-full transition-all border-border/60 shadow-sm",
                    canNavigate
                      ? "hover:shadow-md hover:border-border cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <CardHeader className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", color)}>
                        <Icon className="size-5" />
                      </div>
                      <CardTitle className="text-sm font-medium truncate">
                        {t(`dashboard.${key}`)}
                      </CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              )

              return canNavigate ? (
                <Link key={href} href={href} className="min-w-0">
                  {card}
                </Link>
              ) : (
                <div key={href} className="min-w-0 pointer-events-none">
                  {card}
                </div>
              )
            })}
          </div>

          {!hasGroups && (
            <div className="mt-6">
              <EmptyState
                icon={Users}
                title={t("dashboard.noGroupsYet")}
                description={t("dashboard.createFirstGroup")}
              >
                <CreateGroupDialog
                  variant="default"
                  onSuccess={handleGroupCreated}
                />
              </EmptyState>
            </div>
          )}
        </div>
      </ContentContainer>
    </div>
  )
}
