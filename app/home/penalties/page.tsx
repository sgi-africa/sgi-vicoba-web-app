"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, AlertCircle, UserRoundMinus, Download, Loader2 } from "lucide-react"
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
import { getPenalties } from "./_action"
import { getMembers } from "@/app/home/members/_action"
import { AddPenaltyForm } from "@/components/penalties/add-penalty-form"
import { Penalty, Member } from "@/interfaces/interface"
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

function getMemberName(penalty: Penalty, unknownLabel: string): string {
  if (penalty.user) {
    return `${penalty.user.firstName} ${penalty.user.lastName}`
  }
  return unknownLabel
}

function formatPenaltyType(type: string): string {
  if (!type) return "Other"
  return type.charAt(0) + type.slice(1).toLowerCase()
}

function matchesSearch(penalty: Penalty, query: string, unknownLabel: string): boolean {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  const name = getMemberName(penalty, unknownLabel).toLowerCase()
  const type = formatPenaltyType(penalty.type ?? "OTHER").toLowerCase()
  const status = (penalty.status?.toUpperCase() === "PAID" ? "paid" : "unpaid").toLowerCase()
  return name.includes(q) || type.includes(q) || status.includes(q)
}

export default function PenaltiesPage() {
  const { t } = useTranslation()
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const [penalties, setPenalties] = useState<Penalty[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const groupId = activeGroup?.id

  const filteredPenalties = useMemo(
    () => penalties.filter((p) => matchesSearch(p, searchQuery, t("common.unknownMember"))),
    [penalties, searchQuery, t]
  )

  useEffect(() => {
    if (!groupId) return
    let cancelled = false
    void (async () => {
      setIsLoading(true)
      try {
        const [pens, mems] = await Promise.all([
          getPenalties(groupId),
          getMembers(groupId),
        ])
        if (!cancelled) {
          setPenalties(pens)
          setMembers(mems)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [groupId])

  const handleAddSuccess = async () => {
    if (!groupId) return
    const [pens, mems] = await Promise.all([
      getPenalties(groupId),
      getMembers(groupId),
    ])
    setPenalties(pens)
    setMembers(mems)
    setOpen(false)
    toast.success(t("notifications.penaltyAdded"))
  }

  const totalAmount = penalties.reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
  const totalPaid = penalties
    .filter((p) => p.status?.toUpperCase() === "PAID")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
  const totalUnpaid = penalties
    .filter((p) => p.status?.toUpperCase() !== "PAID")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)

  function handleDownloadPenalties() {
    if (!activeGroup || penalties.length === 0) return

    const doc = new jsPDF()
    const groupName = activeGroup.name
    const date = new Date().toLocaleDateString("en-TZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    doc.setFontSize(18)
    doc.text(t("penalties.title"), 14, 20)
    doc.setFontSize(12)
    doc.text(groupName, 14, 28)
    doc.text(date, 14, 34)

    autoTable(doc, {
      startY: 42,
      head: [[t("contributions.member"), t("common.date"), t("common.type"), t("common.amount"), t("common.status")]],
      body: penalties.map((p) => [
        getMemberName(p, t("common.unknownMember")),
        formatDate(p.createdAt),
        formatPenaltyType(p.type ?? "OTHER"),
        formatAmount(p.amount),
        p.status?.toUpperCase() === "PAID" ? t("common.paid") : t("common.unpaid"),
      ]),
      theme: "striped",
    })

    const tableEndY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 42
    autoTable(doc, {
      startY: tableEndY + 10,
      head: [["Summary", "Amount"]],
      body: [
        [t("penalties.totalPenalties"), formatAmount(totalAmount)],
        [t("common.paid"), formatAmount(totalPaid)],
        [t("common.unpaid"), formatAmount(totalUnpaid)],
      ],
      theme: "plain",
    })

    doc.save(`${groupName.replace(/\s+/g, "-")}-penalties-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  if (!activeGroup || !groupId) {
    return (
      <ContentContainer className="pt-5">
        <EmptyState
          icon={UserRoundMinus}
          title={t("common.noGroupSelected")}
          description={t("common.selectGroupToViewPenalties")}
        />
      </ContentContainer>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      <PageHeader
        title={t("penalties.title")}
        description={t("members.countInGroup", {
          count: penalties.length,
          label: penalties.length === 1 ? t("common.penalty") : t("common.penalties"),
        })}
      >
        {penalties.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 border-border/60"
            onClick={handleDownloadPenalties}
            title={t("penalties.downloadPenalties")}
          >
            <Download className="size-4" />
          </Button>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              {t("penalties.addPenalty")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("penalties.addPenaltyTitle")}</DialogTitle>
            </DialogHeader>
            <AddPenaltyForm
              groupId={groupId}
              members={members}
              onSuccess={handleAddSuccess}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <ContentContainer>
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SummaryCard label={t("penalties.totalPenalties")} value={formatAmount(totalAmount)} />
          <SummaryCard label={t("common.paid")} value={formatAmount(totalPaid)} valueClassName="text-emerald-600 dark:text-emerald-400" />
          <SummaryCard label={t("common.unpaid")} value={formatAmount(totalUnpaid)} valueClassName="text-amber-600 dark:text-amber-400" />
        </div>

        {penalties.length > 0 && !isLoading && (
          <div className="mb-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t("penalties.searchPlaceholder")}
            />
          </div>
        )}

        {isLoading ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="size-6 text-muted-foreground animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">{t("penalties.loadingPenalties")}</p>
            </CardContent>
          </Card>
        ) : penalties.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title={t("penalties.noPenaltiesYet")}
            description={t("penalties.recordFirstPenalty")}
          />
        ) : filteredPenalties.length === 0 ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                {searchQuery.trim() ? t("penalties.noMatchSearch") : t("penalties.noPenaltiesYet")}
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
            {filteredPenalties.map((penalty) => (
              <Card
                key={penalty.id}
                className="shadow-sm border-border/60 transition-all hover:shadow-md hover:border-border"
              >
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {getMemberName(penalty, t("common.unknownMember"))
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{getMemberName(penalty, t("common.unknownMember"))}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(penalty.createdAt)} · {formatPenaltyType(penalty.type ?? "OTHER")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-semibold text-foreground">
                      {formatAmount(penalty.amount)}
                    </span>
                    <StatusBadge
                      label={penalty.status?.toUpperCase() === "PAID" ? t("common.paid") : t("common.unpaid")}
                      variant={penalty.status?.toUpperCase() === "PAID" ? "success" : "warning"}
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
