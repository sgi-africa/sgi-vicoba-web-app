"use client"

import { useState, useEffect } from "react"
import { Plus, Wallet } from "lucide-react"
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
import { getContributions } from "./_action"
import { getMembers } from "@/app/home/members/_action"
import { getPenalties } from "@/app/home/penalties/_action"
import { AddContributionForm } from "@/components/contributions/add-contribution-form"
import { Contribution, Member, Penalty } from "@/interfaces/interface"
import { toast } from "sonner"

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

function getMemberName(contribution: Contribution): string {
  if (contribution.user) {
    return `${contribution.user.firstName} ${contribution.user.lastName}`
  }
  return "Unknown member"
}

export default function ContributionsPage() {
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [penalties, setPenalties] = useState<Penalty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const groupId = activeGroup?.id

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
    toast.success("Contribution added successfully")
  }

  if (!activeGroup || !groupId) {
    return (
      <div className="flex flex-col flex-1 overflow-auto w-full px-4 py-4 md:px-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Wallet className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No group selected</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Select a group from the dashboard to view contributions.
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
          <h2 className="text-2xl font-bold tracking-tight">
            Contribution Ledger
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {contributions.length}{" "}
            {contributions.length === 1 ? "contribution" : "contributions"}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 cursor-pointer sm:ml-auto">
              <Plus className="size-4" />
              Add contribution
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add contribution</DialogTitle>
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
      </div>

      <div className="flex-1 px-4 md:px-6 pb-6">
        {isLoading ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-sm text-muted-foreground">Loading contributions…</p>
            </CardContent>
          </Card>
        ) : contributions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Wallet className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No contributions yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Record your first contribution by clicking the &quot;Add
                contribution&quot; button above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {contributions.map((contribution) => (
              <Card
                key={contribution.id}
                className="transition-colors hover:bg-accent/30 cursor-default"
              >
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                  <div>
                    <p className="font-medium">{getMemberName(contribution)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(contribution.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-primary">
                      {formatAmount(contribution.amount)}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${contribution.type === "SAVINGS"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        }`}
                    >
                      {contribution.type === "SAVINGS" ? "Savings" : "Jamii"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
