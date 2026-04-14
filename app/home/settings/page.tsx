"use client"

import { useState, useEffect } from "react"
import { Settings, Building2, Users, Calendar, Wallet, AlertCircle, Loader2, User } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAppSelector, useAppDispatch } from "@/hooks/redux"
import { setActiveGroup } from "@/store/groupSlice"
import { getMe, getGroup } from "./_action"
import { EditGroupForm } from "@/components/settings/edit-group-form"
import { EditProfileForm } from "@/components/settings/edit-profile-form"
import { GroupResponse, MemberUser } from "@/interfaces/interface"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ContentContainer } from "@/components/shared/content-container"
import { formatDate } from "@/utils/formatDate"
import { formatAmount } from "@/utils/formatAmount"

export default function SettingsPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const [group, setGroup] = useState<GroupResponse | null>(null)
  const [me, setMe] = useState<MemberUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const groupId = activeGroup?.id

  useEffect(() => {
    if (!groupId) {
      queueMicrotask(() => {
        setGroup(null)
        setMe(null)
        setIsLoading(false)
      })
      return
    }
    let cancelled = false
    Promise.all([getGroup(groupId), getMe()])
      .then(([groupData, meData]) => {
        if (!cancelled) {
          setGroup(groupData ?? null)
          setMe(meData ?? null)
        }
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
    toast.success(t("notifications.groupSettingsUpdated"))
  }

  const handleProfileUpdateSuccess = (updated: MemberUser) => {
    setMe(updated)
    toast.success(t("notifications.profileUpdated"))
  }

  if (!activeGroup || !groupId) {
    return (
      <ContentContainer className="pt-5">
        <EmptyState
          icon={Settings}
          title={t("common.noGroupSelected")}
          description={t("common.selectGroupToViewSettings")}
        />
      </ContentContainer>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      <PageHeader
        title={t("settings.title")}
        description={t("settings.manageGroupSettings")}
      />

      <ContentContainer>
        <div className="space-y-6 max-w-3xl">
          {isLoading ? (
            <Card className="shadow-sm border-border/60">
              <CardContent className="py-12">
                <div className="flex flex-col items-center">
                  <Loader2 className="size-6 text-muted-foreground animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground">Loading settings...</p>
                </div>
              </CardContent>
            </Card>
          ) : group ? (
            <>
              <Card className="shadow-sm border-border/60">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <User className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{t("settings.profileTitle")}</CardTitle>
                      <CardDescription>{t("settings.profileDescription")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {me ? (
                    <EditProfileForm
                      key={`${me.id}-${me.firstName}-${me.lastName}-${me.email ?? ""}-${me.phone}`}
                      member={me}
                      onSuccess={handleProfileUpdateSuccess}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("settings.profileLoadError")}</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/60">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <AlertCircle className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{t("settings.groupInfo")}</CardTitle>
                      <CardDescription>{t("settings.overviewReadOnly")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 min-w-0">
                      <Users className="size-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("settings.members")}</p>
                        <p className="text-xl font-bold text-foreground">{group.members?.length ?? 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 min-w-0">
                      <Wallet className="size-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("settings.totalBalance")}</p>
                        <p className="text-xl font-bold text-foreground">{formatAmount(group.totalBalance ?? 0)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 min-w-0 sm:col-span-2 lg:col-span-1">
                      <Calendar className="size-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("settings.created")}</p>
                        <p className="text-sm text-foreground">{formatDate(group.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/60">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{t("settings.groupDetails")}</CardTitle>
                      <CardDescription>{t("settings.updateGroupDetails")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <EditGroupForm group={group} onSuccess={handleUpdateSuccess} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow-sm border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <AlertCircle className="size-10 text-muted-foreground mb-4" />
                <h3 className="text-base font-semibold mb-1">{t("settings.couldNotLoadGroup")}</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  {t("settings.fetchError")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ContentContainer>
    </div>
  )
}
