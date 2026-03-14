"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DialogClose,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AddMeetingFormProps } from "@/interfaces/interface"
import { cn } from "@/lib/utils"
import { addMeeting } from "@/app/home/meetings/_action"


export function AddMeetingForm({ groupId, members, onSuccess, onClose }: AddMeetingFormProps) {
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])

    const today = new Date().toISOString().split("T")[0]

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setIsPending(true)

        const form = e.currentTarget
        const formData = new FormData(form)
        const meetingDate = formData.get("meetingDate") as string
        const nextMeetingDate = formData.get("nextMeetingDate") as string
        const topic = formData.get("topic") as string
        const resolutions = (formData.get("resolutions") as string)?.trim() || undefined

        if (!meetingDate || !nextMeetingDate || !topic?.trim()) {
            setError("Meeting date, next meeting date, and topic are required")
            setIsPending(false)
            return
        }

        const attendeeIds = selectedAttendees.map(Number)

        try {
            await addMeeting(groupId, {
                topic: topic.trim(),
                attendeeIds,
                meetingDate,
                nextMeetingDate,
                resolutions,
            })
            onSuccess?.()
            onClose()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to add meeting"
            setError(message)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                    {error}
                </p>
            )}

            <div className="grid gap-2">
                <Label htmlFor="meetingDate">Meeting date</Label>
                <Input
                    id="meetingDate"
                    name="meetingDate"
                    type="date"
                    defaultValue={today}
                    required
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="nextMeetingDate">Next meeting date</Label>
                <Input
                    id="nextMeetingDate"
                    name="nextMeetingDate"
                    type="date"
                    min={today}
                    required
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="topic">Meeting topic</Label>
                <Input
                    id="topic"
                    name="topic"
                    placeholder="e.g. Monthly savings review"
                    required
                />
            </div>

            <div className="grid gap-2">
                <Label>Attendees</Label>
                <div
                    className={cn(
                        "max-h-32 overflow-y-auto rounded-md border border-input p-2 space-y-2",
                        "bg-transparent"
                    )}
                >
                    {members.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                            No members in this group yet.
                        </p>
                    ) : (
                        members.map((member) => (
                            <label
                                key={member.id}
                                className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded px-2 py-1.5 -mx-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedAttendees.includes(String(member.userId))}
                                    onChange={() => {
                                        const id = String(member.userId)
                                        setSelectedAttendees((prev) =>
                                            prev.includes(id)
                                                ? prev.filter((x) => x !== id)
                                                : [...prev, id]
                                        )
                                    }}
                                    className="rounded border-input"
                                />
                                <span className="text-sm">
                                    {member.user.firstName} {member.user.lastName}
                                </span>
                            </label>
                        ))
                    )}
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="resolutions">Resolutions</Label>
                <Textarea
                    id="resolutions"
                    name="resolutions"
                    placeholder="Optional meeting resolutions..."
                    rows={3}
                />
            </div>

            <DialogFooter className="gap-4 sm:gap-4 pt-2">
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isPending}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Adding…" : "Add meeting"}
                </Button>
            </DialogFooter>
        </form>
    )
}
