"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, HandCoins, Download, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useAppSelector } from "@/hooks/redux"
import { getMembers } from "@/app/home/members/_action"
import { Member, LoanRequest } from "@/interfaces/interface"
import { AddLoanForm } from "@/components/loans/add-loan-form"
import { RepayLoanDialog } from "@/components/loans/repay-loan-dialog"
import { getLoans } from "@/app/home/loans/_action"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { PageHeader } from "@/components/shared/page-header"
import { SummaryCard } from "@/components/shared/summary-card"
import { EmptyState } from "@/components/shared/empty-state"
import { SearchInput } from "@/components/shared/search-input"
import { StatusBadge } from "@/components/shared/status-badge"
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
    return new Date(dateStr).toLocaleDateString()
  } catch {
    return dateStr
  }
}

function getStatusVariant(status: LoanRequest["status"]): "success" | "warning" | "error" {
  switch (status) {
    case "PAID": return "success"
    case "PENDING": return "warning"
    case "OVERDUE": return "error"
    default: return "warning"
  }
}

function matchesSearch(loan: LoanRequest, query: string): boolean {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  const name = `${loan.requester.firstName} ${loan.requester.lastName}`.toLowerCase()
  const status = loan.status.toLowerCase()
  return name.includes(q) || status.includes(q)
}

/** Uses `loan.remaining` from API, or totalRepayment − sum(repayments) */
function getLoanRemaining(loan: LoanRequest): number {
  if (typeof loan.remaining === "number" && !Number.isNaN(loan.remaining)) {
    return loan.remaining
  }
  const total = Number(loan.totalRepayment)
  const paid =
    loan.repayments?.reduce((sum, r) => sum + Number(r.amount), 0) ?? 0
  return Math.max(0, total - paid)
}

/** Total repaid on a loan (installments); uses `repayments` when present */
function getTotalRepaidOnLoan(loan: LoanRequest): number {
  if (loan.repayments?.length) {
    return loan.repayments.reduce((sum, r) => sum + Number(r.amount), 0)
  }
  if (loan.status === "PAID") {
    return Number(loan.totalRepayment)
  }
  return Math.max(0, Number(loan.totalRepayment) - getLoanRemaining(loan))
}

export default function LoansPage() {
  const { t } = useTranslation()
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const [loans, setLoans] = useState<LoanRequest[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const groupId = activeGroup?.id

  const filteredLoans = useMemo(
    () => loans.filter((loan) => matchesSearch(loan, searchQuery)),
    [loans, searchQuery]
  )

  useEffect(() => {
    if (!groupId) return
    let cancelled = false
    void (async () => {
      setIsLoading(true)
      try {
        const [membersData, loansData] = await Promise.all([
          getMembers(groupId),
          getLoans(groupId),
        ])
        if (cancelled) return
        setMembers(membersData ?? [])
        setLoans(loansData ?? [])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [groupId])

  const handleAddSuccess = async () => {
    setOpen(false)
    toast.success(t("notifications.loanAdded"))
    if (!groupId) return
    try {
      const loansData = await getLoans(groupId)
      setLoans(loansData ?? [])
    } catch {
    }
  }

  function handleDownloadLoans() {
    if (!activeGroup || loans.length === 0) return

    const doc = new jsPDF()
    const groupName = activeGroup.name
    const date = new Date().toLocaleDateString("en-TZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    doc.setFontSize(18)
    doc.text(t("loans.title"), 14, 20)
    doc.setFontSize(12)
    doc.text(groupName, 14, 28)
    doc.text(date, 14, 34)

    autoTable(doc, {
      startY: 42,
      head: [[t("loans.borrower"), t("loans.principal"), t("loans.dueDate"), t("common.status")]],
      body: loans.map((loan) => [
        `${loan.requester.firstName} ${loan.requester.lastName}`,
        formatAmount(loan.totalRepayment),
        formatDate(loan.dueDate),
        loan.status.toLowerCase(),
      ]),
      theme: "striped",
    })

    const tableEndY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 42
    autoTable(doc, {
      startY: tableEndY + 10,
      head: [["Summary", "Amount"]],
      body: [
        [t("loans.totalRequested"), formatAmount(totalRequested)],
        [t("loans.paid"), formatAmount(totalPaid)],
        [t("loans.pending"), formatAmount(totalPending)],
      ],
      theme: "plain",
    })

    doc.save(`${groupName.replace(/\s+/g, "-")}-loans-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const totalRequested = loans.reduce(
    (sum, loan) => sum + Number(loan.principal ?? 0),
    0
  )
  /** Cumulative repayments received (updates after each successful repay) */
  const totalPaid = loans.reduce(
    (sum, loan) => sum + getTotalRepaidOnLoan(loan),
    0
  )
  /** Outstanding balance on loans not yet fully paid */
  const totalPending = loans
    .filter((loan) => loan.status !== "PAID")
    .reduce((sum, loan) => sum + getLoanRemaining(loan), 0)

  if (!activeGroup) {
    return (
      <ContentContainer className="pt-5">
        <EmptyState
          icon={HandCoins}
          title={t("common.noGroupSelected")}
          description={t("common.selectGroupToViewLoans")}
        />
      </ContentContainer>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      <PageHeader
        title={t("loans.title")}
        description={t("members.countInGroup", {
          count: loans.length,
          label: loans.length === 1 ? t("common.loan") : t("common.loans"),
        })}
      >
        {loans.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 border-border/60"
            onClick={handleDownloadLoans}
            title={t("common.download") + " " + t("common.loans")}
          >
            <Download className="size-4" />
          </Button>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              {t("loans.addLoan")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("loans.addNewLoan")}</DialogTitle>
            </DialogHeader>
            {groupId && (
              <AddLoanForm
                groupId={groupId}
                members={members}
                onSuccess={handleAddSuccess}
                onClose={() => setOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </PageHeader>

      <ContentContainer>
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SummaryCard label={t("loans.totalRequested")} value={formatAmount(totalRequested)} />
          <SummaryCard label={t("loans.paid")} value={formatAmount(totalPaid)} valueClassName="text-emerald-600 dark:text-emerald-400" />
          <SummaryCard label={t("loans.pending")} value={formatAmount(totalPending)} valueClassName="text-amber-600 dark:text-amber-400" />
        </div>

        {loans.length > 0 && !isLoading && (
          <div className="mb-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t("loans.searchPlaceholder")}
            />
          </div>
        )}

        {isLoading ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="size-6 text-muted-foreground animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">{t("loans.loadingLoans")}</p>
            </CardContent>
          </Card>
        ) : loans.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title={t("loans.noLoansYet")}
            description={t("loans.disburseFirstLoan")}
          />
        ) : filteredLoans.length === 0 ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                {searchQuery.trim() ? t("loans.noMatchSearch") : t("loans.noLoansYet")}
              </p>
              {searchQuery.trim() && (
                <Button variant="link" className="mt-2" onClick={() => setSearchQuery("")}>
                  {t("common.clearSearch")}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredLoans.map((loan) => (
                <Card
                  key={loan.id}
                  className="shadow-sm border-border/60 transition-all hover:shadow-md hover:border-border"
                >
                  <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {`${loan.requester.firstName} ${loan.requester.lastName}`
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {loan.requester.firstName} {loan.requester.lastName}
                        </p>
                        <div className="block space-y-0.5 text-sm text-muted-foreground">
                          <p>
                            {t("loans.requestedLabel")} -{" "}
                            {formatDate(loan.createdAt)}
                          </p>
                          <p>
                            {t("loans.dueLabel")} - {formatDate(loan.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-center gap-0.5 sm:min-w-28 sm:flex-1 sm:justify-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("loans.remaining")}
                      </span>
                      <span className="font-semibold text-foreground tabular-nums">
                        {formatAmount(getLoanRemaining(loan))}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge
                        label={loan.status.toLowerCase()}
                        variant={getStatusVariant(loan.status)}
                      />
                      <span className="font-semibold text-foreground tabular-nums">
                        {formatAmount(loan.totalRepayment)}
                      </span>
                      <RepayLoanDialog
                        loan={loan}
                        onSuccess={(summary) => {
                          setLoans((prev) =>
                            prev.map((l) =>
                              l.id === summary.loan.id
                                ? {
                                    ...summary.loan,
                                    remaining: summary.remaining,
                                  }
                                : l
                            )
                          )
                        }}
                      />
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
