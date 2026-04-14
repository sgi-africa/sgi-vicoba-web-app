"use client"

import { useState, useEffect, useMemo } from "react"
import { Banknote, Coins, ShoppingCart, Info, BanknoteArrowUp, Download } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useAppSelector, useAppDispatch } from "@/hooks/redux"
import { markSharesConfigured } from "@/store/groupSlice"
import { AddSharesModal } from "@/components/shares/add-shares-modal"
import { SellSharesModal } from "@/components/shares/sell-shares-modal"
import { getGroupShares, getMemberShares } from "./_action"
import { getMembers } from "@/app/home/members/_action"
import { toast } from "sonner"
import { MemberSharesRow } from "@/interfaces/interface"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { SearchInput } from "@/components/shared/search-input"
import { ContentContainer } from "@/components/shared/content-container"
import { formatAmount } from "@/utils/global/formatAmount"
import { matchesSearch } from "@/utils/shares/share"


export default function SharesPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const sharesConfiguredGroupIds = useAppSelector((state) => state.group.sharesConfiguredGroupIds)
  const groupId = activeGroup?.id

  const hasSharesConfigured = groupId ? sharesConfiguredGroupIds.includes(groupId) : false

  const [shares, setShares] = useState<{ sharePrice: string; availableShares: number } | null>(null)
  const [memberShares, setMemberShares] = useState<MemberSharesRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMemberShares = useMemo(
    () => memberShares.filter((row) => matchesSearch(row, searchQuery)),
    [memberShares, searchQuery]
  )

  useEffect(() => {
    if (!groupId) return
    let cancelled = false
    void (async () => {
      setIsLoading(true)
      try {
        const data = await getGroupShares(groupId)
        if (!cancelled && data) {
          setShares({
            sharePrice: data.group.sharePrice ?? "0",
            availableShares: data.availableShares ?? 0,
          })
          if (data.group.totalShares > 0) {
            dispatch(markSharesConfigured(groupId))
          }
        } else if (!cancelled) {
          setShares({ sharePrice: "0", availableShares: 0 })
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [groupId, dispatch])

  useEffect(() => {
    if (!groupId) return
    let cancelled = false
    void (async () => {
      setIsTableLoading(true)
      try {
        const members = await getMembers(groupId)
        const results = await Promise.all(
          members.map(async (member) => {
            const data = await getMemberShares(groupId, member.userId)
            return {
              userId: member.userId,
              name: `${member.user.firstName} ${member.user.lastName}`,
              totalShares: data?.totalShares ?? 0,
            }
          })
        )
        if (!cancelled) setMemberShares(results)
      } finally {
        if (!cancelled) setIsTableLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [groupId])

  const handleAddSuccess = async () => {
    if (!groupId) return
    dispatch(markSharesConfigured(groupId))
    const [groupData, members] = await Promise.all([
      getGroupShares(groupId),
      getMembers(groupId),
    ])
    if (groupData) {
      setShares({
        sharePrice: groupData.group.sharePrice ?? "0",
        availableShares: groupData.availableShares ?? 0,
      })
    }
    const memberResults = await Promise.all(
      members.map(async (member) => {
        const data = await getMemberShares(groupId, member.userId)
        return {
          userId: member.userId,
          name: `${member.user.firstName} ${member.user.lastName}`,
          totalShares: data?.totalShares ?? 0,
        }
      })
    )
    setMemberShares(memberResults)
    toast.success(t("notifications.sharesAdded"))
  }

  const handleSellSuccess = async () => {
    if (!groupId) return
    const [groupData, members] = await Promise.all([
      getGroupShares(groupId),
      getMembers(groupId),
    ])
    if (groupData) {
      setShares({
        sharePrice: groupData.group.sharePrice ?? "0",
        availableShares: groupData.availableShares ?? 0,
      })
    }
    const memberResults = await Promise.all(
      members.map(async (member) => {
        const data = await getMemberShares(groupId, member.userId)
        return {
          userId: member.userId,
          name: `${member.user.firstName} ${member.user.lastName}`,
          totalShares: data?.totalShares ?? 0,
        }
      })
    )
    setMemberShares(memberResults)
    toast.success(t("notifications.sharesSold"))
  }

  function handleDownloadShares() {
    if (!activeGroup) return

    const doc = new jsPDF()
    const groupName = activeGroup.name
    const date = new Date().toLocaleDateString("en-TZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    doc.setFontSize(18)
    doc.text(t("shares.title"), 14, 20)
    doc.setFontSize(12)
    doc.text(groupName, 14, 28)
    doc.text(date, 14, 34)

    const startY = 42
    autoTable(doc, {
      startY,
      head: [["Summary", "Value"]],
      body: [
        [t("shares.sharePrice"), formatAmount(sharePrice)],
        [t("shares.sharesAvailable"), String(availableShares)],
      ],
      theme: "plain",
    })

    const tableEndY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 42

    if (memberShares.length > 0) {
      autoTable(doc, {
        startY: tableEndY + 10,
        head: [[t("shares.member"), t("shares.sharesPurchased")]],
        body: memberShares.map((row) => [row.name, String(row.totalShares)]),
        theme: "striped",
      })
    }

    doc.save(`${groupName.replace(/\s+/g, "-")}-shares-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  if (!activeGroup || !groupId) {
    return (
      <ContentContainer className="pt-5">
        <EmptyState
          icon={BanknoteArrowUp}
          title={t("common.noGroupSelected")}
          description={t("common.selectGroupToViewShares")}
        />
      </ContentContainer>
    )
  }

  const availableShares = shares?.availableShares ?? 0
  const sharePrice = shares?.sharePrice ?? "0"

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      <PageHeader
        title={t("shares.title")}
        description={t("shares.manageSharesPricing")}
      >
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 border-border/60"
          onClick={handleDownloadShares}
          title={t("shares.downloadShares")}
        >
          <Download className="size-4" />
        </Button>
        {hasSharesConfigured ? (
          <SellSharesModal
            groupId={groupId}
            members={memberShares.map((m) => ({ userId: m.userId, name: m.name }))}
            onSuccess={handleSellSuccess}
            trigger={
              <Button size="sm" className="gap-2">
                <ShoppingCart className="size-4" />
                {t("shares.sellShares")}
              </Button>
            }
          />
        ) : (
          <AddSharesModal
            groupId={groupId}
            onSuccess={handleAddSuccess}
            variant="default"
          />
        )}
      </PageHeader>

      <ContentContainer>
        {/* Info banner */}
        <Card className="border-border/60 bg-muted/40 mb-6 shadow-none">
          <CardContent className="flex items-start gap-3 py-3">
            <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">{t("shares.configureBanner")}</p>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {isLoading ? (
            <>
              <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-6 w-28 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
              <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-6 w-28 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </>
          ) : (
            <>
              <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Coins className="h-6 w-6" />
                    </div>
                    <div>
                      <CardDescription className="text-xs font-medium uppercase tracking-wide">
                        {t("shares.sharePrice")}
                      </CardDescription>
                      <CardTitle className="text-xl font-bold">{formatAmount(sharePrice)}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{t("shares.perShare")}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Banknote className="h-6 w-6" />
                    </div>
                    <div>
                      <CardDescription className="text-xs font-medium uppercase tracking-wide">
                        {t("shares.sharesAvailable")}
                      </CardDescription>
                      <CardTitle className="text-xl font-bold">{availableShares.toLocaleString()}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{t("shares.totalForGroup")}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </>
          )}
        </div>

        {/* Member shares table */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            {t("shares.sharesByMember")}
          </h3>

          {memberShares.length > 0 && !isTableLoading && (
            <div className="mb-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t("shares.searchPlaceholder")}
              />
            </div>
          )}

          {isTableLoading ? (
            <Card className="shadow-sm border-border/60">
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </Card>
          ) : memberShares.length === 0 ? (
            <Card className="shadow-sm border-border/60">
              <div className="p-8 text-center text-muted-foreground text-sm">
                {t("shares.noMembersInGroup")}
              </div>
            </Card>
          ) : filteredMemberShares.length === 0 ? (
            <Card className="shadow-sm border-border/60">
              <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm">{t("shares.noMatchSearch")}</p>
                <Button variant="link" className="mt-2" onClick={() => setSearchQuery("")}>
                  {t("common.clearSearch")}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="shadow-sm border-border/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/50">
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("shares.member")}
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("shares.sharesPurchased")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMemberShares.map((row) => (
                      <tr key={row.userId} className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3.5 text-sm text-foreground">{row.name}</td>
                        <td className="px-6 py-3.5 text-right text-sm font-medium text-foreground">
                          {row.totalShares.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </ContentContainer>
    </div>
  )
}
