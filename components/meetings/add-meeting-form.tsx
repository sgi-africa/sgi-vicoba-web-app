"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
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
import { addMeetingSchema } from "@/lib/zod"


export function AddMeetingForm({ groupId, members, onSuccess, onClose }: AddMeetingFormProps) {
    const { t } = useTranslation()
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [isPending, setIsPending] = useState(false)
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])

    const today = new Date().toISOString().split("T")[0]

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setFieldErrors({})
        setIsPending(true)

        const form = e.currentTarget
        const formData = new FormData(form)
        const meetingDate = (formData.get("meetingDate") as string) ?? ""
        const nextMeetingDate = (formData.get("nextMeetingDate") as string) ?? ""
        const topic = (formData.get("topic") as string) ?? ""
        const resolutions = (formData.get("resolutions") as string)?.trim() || undefined
        const attendeeIds = selectedAttendees.map(Number)

        const result = addMeetingSchema.safeParse({
            meetingDate,
            nextMeetingDate,
            topic,
            attendeeIds,
            resolutions,
        })

        if (!result.success) {
            const errors: Record<string, string> = {}
            for (const issue of result.error.issues) {
                const path = issue.path[0]?.toString() ?? "form"
                if (!errors[path]) errors[path] = issue.message
            }
            setFieldErrors(errors)
            setIsPending(false)
            return
        }

        try {
            await addMeeting(groupId, {
                topic: result.data.topic,
                attendeeIds: result.data.attendeeIds,
                meetingDate: result.data.meetingDate,
                nextMeetingDate: result.data.nextMeetingDate,
                resolutions: result.data.resolutions,
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
                    aria-invalid={!!fieldErrors.meetingDate}
                />
                {fieldErrors.meetingDate && (
                    <p className="text-sm text-destructive">{fieldErrors.meetingDate}</p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="nextMeetingDate">{t("meetings.nextMeetingDate")}</Label>
                <Input
                    id="nextMeetingDate"
                    name="nextMeetingDate"
                    type="date"
                    min={today}
                    aria-invalid={!!fieldErrors.nextMeetingDate}
                />
                {fieldErrors.nextMeetingDate && (
                    <p className="text-sm text-destructive">{fieldErrors.nextMeetingDate}</p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="topic">{t("meetings.meetingTopic")}</Label>
                <Input
                    id="topic"
                    name="topic"
                    placeholder="e.g. Monthly savings review"
                    aria-invalid={!!fieldErrors.topic}
                />
                {fieldErrors.topic && (
                    <p className="text-sm text-destructive">{fieldErrors.topic}</p>
                )}
            </div>

            <div className="grid gap-2">
                <Label>{t("meetings.attendees")}</Label>
                {fieldErrors.attendeeIds && (
                    <p className="text-sm text-destructive">{fieldErrors.attendeeIds}</p>
                )}
                <div
                    className={cn(
                        "max-h-32 overflow-y-auto rounded-md border border-input p-2 space-y-2",
                        "bg-transparent"
                    )}
                >
                    {members.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                            {t("meetings.noMembersInGroup")}
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
                <Label htmlFor="resolutions">{t("meetings.resolutions")}</Label>
                <Textarea
                    id="resolutions"
                    name="resolutions"
                    placeholder={t("meetings.resolutionsPlaceholder")}
                    rows={3}
                    aria-invalid={!!fieldErrors.resolutions}
                />
                {fieldErrors.resolutions && (
                    <p className="text-sm text-destructive">{fieldErrors.resolutions}</p>
                )}
            </div>

            <DialogFooter className="gap-4 sm:gap-4 pt-2">
                <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending} className="cursor-pointer">
                    {t("common.cancel")}
                </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} className="cursor-pointer">
                {isPending ? t("common.adding") : t("meetings.addMeetingButton")}
            </Button>
            </DialogFooter>
        </form>
    )
}
