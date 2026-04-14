"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Wallet, Download, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useAppSelector } from "@/hooks/redux"
import { getContributions } from "./_action"
import { getMembers } from "@/app/home/members/_action"
import { getPenalties } from "@/app/home/penalties/_action"
import { AddContributionForm } from "@/components/contributions/add-contribution-form"
import { Contribution, Member, Penalty } from "@/interfaces/interface"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { PageHeader } from "@/components/shared/page-header"
import { SummaryCard } from "@/components/shared/summary-card"
import { EmptyState } from "@/components/shared/empty-state"
import { SearchInput } from "@/components/shared/search-input"
import { StatusBadge } from "@/components/shared/status-badge"
import { ContentContainer } from "@/components/shared/content-container"
import { formatAmount } from "@/utils/global/formatAmount"
import { getMemberName, matchesSearch } from "@/utils/contributions/contribution"
import { formatDate } from "@/utils/global/formatDate"

export default function ContributionsPage() {
  const { t } = useTranslation()
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [penalties, setPenalties] = useState<Penalty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const groupId = activeGroup?.id

  const filteredContributions = useMemo(
    () => contributions.filter((c) => matchesSearch(c, searchQuery, t("common.unknownMember"))),
    [contributions, searchQuery, t]
  )

  useEffect(() => {
    if (!groupId) return
    let cancelled = false
    void (async () => {
      setIsLoading(true)
      try {
        const [contribs, mems, pens] = await Promise.all([
          getContributions(groupId),
          getMembers(groupId),
          getPenalties(groupId),
        ])
        if (!cancelled) {
          setContributions(contribs)
          setMembers(mems)
          setPenalties(pens)
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
    const [contribs, mems, pens] = await Promise.all([
      getContributions(groupId),
      getMembers(groupId),
      getPenalties(groupId),
    ])
    setContributions(contribs)
    setMembers(mems)
    setPenalties(pens)
    setOpen(false)
    toast.success(t("notifications.contributionAdded"))
  }

  function handleDownloadContributions() {
    if (!activeGroup || contributions.length === 0) return

    const doc = new jsPDF()
    const groupName = activeGroup.name
    const date = new Date().toLocaleDateString("en-TZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    doc.setFontSize(18)
    doc.text(t("contributions.title"), 14, 20)
    doc.setFontSize(12)
    doc.text(groupName, 14, 28)
    doc.text(date, 14, 34)

    autoTable(doc, {
      startY: 42,
      head: [[t("contributions.member"), t("common.date"), t("common.amount"), t("common.type")]],
      body: contributions.map((c) => [
        getMemberName(c, t("common.unknownMember")),
        formatDate(c.createdAt),
        formatAmount(c.amount),
        c.type === "SAVINGS" ? t("common.savings") : t("common.jamii"),
      ]),
      theme: "striped",
    })

    const tableEndY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 42
    autoTable(doc, {
      startY: tableEndY + 10,
      head: [["Summary", "Amount"]],
      body: [
        [t("contributions.totalSavings"), formatAmount(totalSavings)],
        [t("contributions.totalJamii"), formatAmount(totalJamii)],
      ],
      theme: "plain",
    })

    doc.save(`${groupName.replace(/\s+/g, "-")}-contributions-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  if (!activeGroup || !groupId) {
    return (
      <ContentContainer className="pt-5">
        <EmptyState
          icon={Wallet}
          title={t("common.noGroupSelected")}
          description={t("common.selectGroupToViewContributions")}
        />
      </ContentContainer>
    )
  }

  const totalSavings = contributions
    .filter((c) => c.type === "SAVINGS")
    .reduce((sum, c) => sum + Number(c.amount ?? 0), 0)

  const totalJamii = contributions
    .filter((c) => c.type === "JAMII")
    .reduce((sum, c) => sum + Number(c.amount ?? 0), 0)

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      <PageHeader
        title={t("contributions.title")}
        description={`${contributions.length} ${contributions.length === 1 ? t("common.contribution") : t("common.contributions")}`}
      >
        {contributions.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 border-border/60"
            onClick={handleDownloadContributions}
            title={t("common.download") + " " + t("common.contributions")}
          >
            <Download className="size-4" />
          </Button>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              {t("contributions.addContribution")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("contributions.addContributionTitle")}</DialogTitle>
            </DialogHeader>
            <AddContributionForm
              groupId={groupId}
              members={members}
              penalties={penalties}
              onSuccess={handleAddSuccess}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <ContentContainer>
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <SummaryCard
            label={t("contributions.totalSavings")}
            value={formatAmount(totalSavings)}
          />
          <SummaryCard
            label={t("contributions.totalJamii")}
            value={formatAmount(totalJamii)}
          />
        </div>

        {contributions.length > 0 && !isLoading && (
          <div className="mb-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t("contributions.searchPlaceholder")}
            />
          </div>
        )}

        {isLoading ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="size-6 text-muted-foreground animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">{t("contributions.loadingContributions")}</p>
            </CardContent>
          </Card>
        ) : contributions.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={t("contributions.noContributionsYet")}
            description={t("contributions.recordFirstContribution")}
          />
        ) : filteredContributions.length === 0 ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                {searchQuery.trim() ? t("contributions.noMatchSearch") : t("contributions.noContributionsYet")}
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
            {filteredContributions.map((contribution) => (
              <Card
                key={contribution.id}
                className="shadow-sm border-border/60 transition-all hover:shadow-md hover:border-border"
              >
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {getMemberName(contribution, t("common.unknownMember"))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(contribution.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-semibold text-foreground">
                      {formatAmount(contribution.amount)}
                    </span>
                    <StatusBadge
                      label={contribution.type === "SAVINGS" ? t("common.savings") : t("common.jamii")}
                      variant={contribution.type === "SAVINGS" ? "success" : "warning"}
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
