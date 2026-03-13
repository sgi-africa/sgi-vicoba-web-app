"use client"

import { useState } from "react"
import { Plus, ClipboardList, MapPin, Calendar } from "lucide-react"
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

// Dummy type – replace with backend type later
interface DummyMeeting {
  id: number
  title: string
  scheduledAt: string
  location: string
  attendeeCount: number
  status: "scheduled" | "completed" | "cancelled"
}

function formatDateTime(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-TZ", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

// Dummy data – replace with API call later
const DUMMY_MEETINGS: DummyMeeting[] = [
  {
    id: 1,
    title: "Monthly savings review",
    scheduledAt: "2025-03-20T10:00:00",
    location: "Group office, Dar es Salaam",
    attendeeCount: 12,
    status: "scheduled",
  },
  {
    id: 2,
    title: "Loan committee meeting",
    scheduledAt: "2025-03-15T14:00:00",
    location: "Community hall",
    attendeeCount: 8,
    status: "completed",
  },
  {
    id: 3,
    title: "Quarterly general assembly",
    scheduledAt: "2025-04-01T09:00:00",
    location: "TBD",
    attendeeCount: 0,
    status: "scheduled",
  },
]

function getStatusStyle(status: DummyMeeting["status"]) {
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

export default function MeetingsPage() {
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const [meetings] = useState<DummyMeeting[]>(DUMMY_MEETINGS)
  const [isLoading] = useState(false)
  const [open, setOpen] = useState(false)

  if (!activeGroup) {
    return (
      <div className="flex flex-col flex-1 overflow-auto w-full px-4 py-4 md:px-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="rounded-full bg-muted p-4 mb-4">
              <ClipboardList className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No group selected</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Select a group from the dashboard to view and manage meetings.
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
          <h2 className="text-2xl font-bold tracking-tight">Meetings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {meetings.length}{" "}
            {meetings.length === 1 ? "meeting" : "meetings"} in this group
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 cursor-pointer">
              <Plus className="size-4" />
              Add meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add new meeting</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-4">
              Meeting form will be wired to the backend later.
            </p>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 px-4 md:px-6 pb-6">
        {isLoading ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-sm text-muted-foreground">Loading meetings…</p>
            </CardContent>
          </Card>
        ) : meetings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ClipboardList className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No meetings yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Schedule your first meeting by clicking &quot;Add meeting&quot;.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {meetings.map((meeting) => (
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
                      <p className="font-medium truncate">{meeting.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Calendar className="size-3.5 shrink-0" />
                        {formatDateTime(meeting.scheduledAt)}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <MapPin className="size-3.5 shrink-0" />
                        {meeting.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getStatusStyle(meeting.status)}`}
                    >
                      {meeting.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {meeting.attendeeCount}{" "}
                      {meeting.attendeeCount === 1 ? "attendee" : "attendees"}
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
