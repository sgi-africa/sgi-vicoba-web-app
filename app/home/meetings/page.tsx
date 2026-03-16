"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, ClipboardList, Calendar, Download, Search } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { useAppSelector } from "@/hooks/redux"
import { getMembers } from "@/app/home/members/_action"
import { getGroupMeetings } from "@/app/home/meetings/_action"
import { AddMeetingForm } from "@/components/meetings/add-meeting-form"
import { Member, GroupMeetingsResponse } from "@/interfaces/interface"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

function formatDateTime(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-TZ", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function getStatusFromDate(nextMeetingDate: string) {
  const next = new Date(nextMeetingDate)
  const now = new Date()
  return next >= now ? "scheduled" : "completed"
}

function getStatusStyle(status: string) {
  switch (status) {
    case "scheduled":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400"
    case "completed":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
    case "cancelled":
      return "bg-slate-500/15 text-slate-700 dark:text-slate-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function matchesSearch(meeting: GroupMeetingsResponse, query: string): boolean {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  const topic = (meeting.topic ?? "").toLowerCase()
  const resolutions = (meeting.resolutions ?? "").toLowerCase()
  const status = getStatusFromDate(meeting.nextMeetingDate).toLowerCase()
  const attendeeNames = (meeting.attendees ?? [])
    .map((a) => `${a.user?.firstName ?? ""} ${a.user?.lastName ?? ""}`.trim().toLowerCase())
    .join(" ")
  return (
    topic.includes(q) ||
    resolutions.includes(q) ||
    status.includes(q) ||
    attendeeNames.includes(q)
  )
}

export default function MeetingsPage() {
  const { t } = useTranslation()
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const [meetings, setMeetings] = useState<GroupMeetingsResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const groupId = activeGroup?.id

  const filteredMeetings = useMemo(
    () => meetings.filter((m) => matchesSearch(m, searchQuery)),
    [meetings, searchQuery]
  )

  useEffect(() => {
    if (!groupId) return
    getMembers(groupId).then(setMembers)
  }, [groupId])

  useEffect(() => {
    if (!groupId) {
      queueMicrotask(() => {
        setMeetings([])
        setIsLoading(false)
      })
      return
    }
    queueMicrotask(() => setIsLoading(true))
    getGroupMeetings(groupId)
      .then((data) => setMeetings(Array.isArray(data) ? data : []))
      .catch(() => setMeetings([]))
      .finally(() => setIsLoading(false))
  }, [groupId])

  function handleDownloadMeetings() {
    if (!activeGroup || meetings.length === 0) return

    const doc = new jsPDF()
    const groupName = activeGroup.name
    const date = new Date().toLocaleDateString("en-TZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    doc.setFontSize(18)
    doc.text(t("sidebar.meetingsMinutes"), 14, 20)
    doc.setFontSize(12)
    doc.text(groupName, 14, 28)
    doc.text(date, 14, 34)

    autoTable(doc, {
      startY: 42,
      head: [[t("meetings.topic"), t("common.nextMeeting"), t("common.status"), t("common.attendees")]],
      body: meetings.map((m) => [
        m.topic,
        formatDateTime(m.nextMeetingDate),
        getStatusFromDate(m.nextMeetingDate),
        String(m.attendees?.length ?? 0),
      ]),
      theme: "striped",
    })

    doc.save(`${groupName.replace(/\s+/g, "-")}-meetings-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  if (!activeGroup) {
    return (
      <div className="flex flex-col flex-1 overflow-auto w-full px-4 py-4 md:px-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="rounded-full bg-muted p-4 mb-4">
              <ClipboardList className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{t("common.noGroupSelected")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {t("common.selectGroupToViewMeetings")}
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
          <h2 className="text-2xl font-bold tracking-tight">{t("meetings.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("members.countInGroup", { count: meetings.length, label: meetings.length === 1 ? t("common.meeting") : t("common.meetings") })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {meetings.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer shrink-0"
              onClick={handleDownloadMeetings}
              title={t("meetings.downloadMeetings")}
            >
              <Download className="size-4" />
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 cursor-pointer">
                <Plus className="size-4" />
                {t("meetings.addMeeting")}
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("meetings.addNewMeeting")}</DialogTitle>
            </DialogHeader>
            {groupId && (
              <AddMeetingForm
                groupId={groupId}
                members={members}
                onSuccess={() => {
                  setOpen(false)
                  toast.success(t("notifications.meetingCreated"))
                  if (groupId) {
                    getGroupMeetings(groupId).then((data) =>
                      setMeetings(Array.isArray(data) ? data : [])
                    )
                  }
                }}
                onClose={() => setOpen(false)}
              />
            )}
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-6 pb-6">
        {meetings.length > 0 && !isLoading && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={t("meetings.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-muted/50"
              aria-label="Search meetings"
            />
          </div>
        )}
        {isLoading ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-sm text-muted-foreground">{t("meetings.loadingMeetings")}</p>
            </CardContent>
          </Card>
        ) : meetings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ClipboardList className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{t("meetings.noMeetingsYet")}</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {t("meetings.scheduleFirstMeeting")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredMeetings.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery.trim()
                      ? t("meetings.noMatchSearch")
                      : t("meetings.noMeetingsYet")}
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
              filteredMeetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  className="transition-colors hover:bg-accent/30 cursor-default"
                >
                  <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Calendar className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{meeting.topic}</p>

                        {meeting.resolutions && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                            {meeting.resolutions}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Calendar className="size-3.5 shrink-0" />
                          {t("common.nextMeeting")}: {formatDateTime(meeting.nextMeetingDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getStatusStyle(getStatusFromDate(meeting.nextMeetingDate))}`}
                      >
                        {getStatusFromDate(meeting.nextMeetingDate)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {meeting.attendees?.length ?? 0}{" "}
                        {(meeting.attendees?.length ?? 0) === 1 ? t("common.attendee") : t("common.attendees")}
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
