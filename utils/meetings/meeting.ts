import { GroupMeetingsResponse } from "@/interfaces/interface"

export function getStatusFromDate(nextMeetingDate: string) {
    const next = new Date(nextMeetingDate)
    const now = new Date()
    return next >= now ? "scheduled" : "completed"
}

export function matchesSearch(meeting: GroupMeetingsResponse, query: string): boolean {
    if (!query.trim()) return true
    const q = query.trim().toLowerCase()
    const topic = (meeting.topic ?? "").toLowerCase()
    const resolutions = (meeting.resolutions ?? "").toLowerCase()
    const status = getStatusFromDate(meeting.nextMeetingDate).toLowerCase()
    const attendeeNames = (meeting.attendees ?? [])
        .map((a) => `${a.user?.firstName ?? ""} ${a.user?.lastName ?? ""}`.trim().toLowerCase())
        .join(" ")
    return topic.includes(q) || resolutions.includes(q) || status.includes(q) || attendeeNames.includes(q)
}