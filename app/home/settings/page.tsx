"use client"

import { useState, useEffect } from "react"
import { Settings, Building2, Users, Calendar, Wallet, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAppSelector, useAppDispatch } from "@/hooks/redux"
import { setActiveGroup } from "@/store/groupSlice"
import { getGroup } from "./_action"
import { EditGroupForm } from "@/components/settings/edit-group-form"
import { GroupResponse } from "@/interfaces/interface"
import { toast } from "sonner"

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-TZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return dateStr
  }
}

function formatAmount(amount: number | string) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const [group, setGroup] = useState<GroupResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const groupId = activeGroup?.id

  useEffect(() => {
    if (!groupId) {
      queueMicrotask(() => {
        setGroup(null)
        setIsLoading(false)
      })
      return
    }
    let cancelled = false
    getGroup(groupId)
      .then((data) => {
        if (!cancelled) setGroup(data ?? null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [groupId])

  const handleUpdateSuccess = (updatedGroup: GroupResponse) => {
    setGroup(updatedGroup)
    dispatch(setActiveGroup(updatedGroup))
    toast.success("Group settings updated successfully")
  }

  if (!activeGroup || !groupId) {
    return (
      <div className="flex flex-col flex-1 overflow-auto w-full px-4 py-4 md:px-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Settings className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No group selected</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Select a group from the dashboard to view and manage its settings.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      <div className="px-4 py-4 md:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your group settings and preferences
          </p>
        </div>

        <div className="space-y-6 w-full">
          {isLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="space-y-4">
                  <div className="h-10 bg-muted rounded animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ) : group ? (
            <>
              {/* Group info (read-only) - above edit form */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <AlertCircle className="size-5" />
                    </div>
                    <div>
                      <CardTitle>Group info</CardTitle>
                      <CardDescription>
                        Overview of your group (read-only)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4 min-w-0">
                      <Users className="size-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Members</p>
                        <p className="text-2xl font-bold">
                          {group.members?.length ?? 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4 min-w-0">
                      <Wallet className="size-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Total balance</p>
                        <p className="text-2xl font-bold">
                          {formatAmount(group.totalBalance ?? 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4 min-w-0 sm:col-span-2 lg:col-span-1">
                      <Calendar className="size-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(group.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Group details (edit form) */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="size-5" />
                    </div>
                    <div>
                      <CardTitle>Group details</CardTitle>
                      <CardDescription>
                        Update your group name, location, and type
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <EditGroupForm
                    group={group}
                    onSuccess={handleUpdateSuccess}
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <AlertCircle className="size-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">Could not load group</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  We couldn&apos;t fetch this group&apos;s details. Please try again later.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
