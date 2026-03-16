"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, HandCoins, Download, Search } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAppSelector } from "@/hooks/redux"
import { getMembers } from "@/app/home/members/_action"
import { Member, LoanRequest } from "@/interfaces/interface"
import { AddLoanForm } from "@/components/loans/add-loan-form"
import { getLoans } from "@/app/home/loans/_action"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

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

function getStatusStyle(status: LoanRequest["status"]) {
  switch (status) {
    case "PAID":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
    case "PENDING":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400"
    case "OVERDUE":
      return "bg-destructive/15 text-destructive dark:text-destructive"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function matchesSearch(loan: LoanRequest, query: string): boolean {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  const name = `${loan.requester.firstName} ${loan.requester.lastName}`.toLowerCase()
  const status = loan.status.toLowerCase()
  return name.includes(q) || status.includes(q)
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
        formatAmount(loan.principal),
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

  const totalRequested = loans.reduce((sum, loan) => sum + Number(loan.principal ?? 0), 0)
  const totalPaid = loans
    .filter((loan) => loan.status === "PAID")
    .reduce((sum, loan) => sum + Number(loan.principal ?? 0), 0)
  const totalPending = loans
    .filter((loan) => loan.status === "PENDING")
    .reduce((sum, loan) => sum + Number(loan.principal ?? 0), 0)

  if (!activeGroup) {
    return (
      <div className="flex flex-col flex-1 overflow-auto w-full px-4 py-4 md:px-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="rounded-full bg-muted p-4 mb-4">
              <HandCoins className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{t("common.noGroupSelected")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {t("common.selectGroupToViewLoans")}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 md:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("loans.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("members.countInGroup", { count: loans.length, label: loans.length === 1 ? t("common.loan") : t("common.loans") })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {loans.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer shrink-0"
              onClick={handleDownloadLoans}
              title={t("common.download") + " " + t("common.loans")}
            >
              <Download className="size-4" />
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 cursor-pointer">
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
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 md:px-6 pb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("loans.totalRequested")}</CardDescription>
            <CardTitle className="text-xl font-bold">
              {formatAmount(totalRequested)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("loans.paid")}</CardDescription>
            <CardTitle className="text-xl font-bold">
              {formatAmount(totalPaid)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("loans.pending")}</CardDescription>
            <CardTitle className="text-xl font-bold">
              {formatAmount(totalPending)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex-1 px-4 md:px-6 pb-6">
        {loans.length > 0 && !isLoading && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={t("loans.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-muted/50"
              aria-label="Search loans"
            />
          </div>
        )}
        {isLoading ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-sm text-muted-foreground">{t("loans.loadingLoans")}</p>
            </CardContent>
          </Card>
        ) : loans.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <HandCoins className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{t("loans.noLoansYet")}</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {t("loans.disburseFirstLoan")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredLoans.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery.trim()
                      ? t("loans.noMatchSearch")
                      : t("loans.noLoansYet")}
                  </p>
                  {searchQuery.trim() && (
                    <Button
                      variant="link"
                      className="mt-2 cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    >
                      {t("common.clearSearch")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredLoans.map((loan) => (
                <Card
                  key={loan.id}
                  className="transition-colors hover:bg-accent/30 cursor-default"
                >
                  <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                        {`${loan.requester.firstName} ${loan.requester.lastName}`
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">
                          {loan.requester.firstName} {loan.requester.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("loans.requestedLabel")} {formatDate(loan.createdAt)} · {t("loans.dueLabel")} {formatDate(loan.dueDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-semibold text-primary">
                        {formatAmount(loan.principal)}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(loan.status)}`}
                      >
                        {loan.status.toLowerCase()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
