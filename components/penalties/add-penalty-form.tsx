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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { addPenalty } from "@/app/home/penalties/_action"
import { addPenaltySchema, PENALTY_TYPES } from "@/lib/zod"
import { AddPenaltyFormProps } from "@/interfaces/interface"
import { Loader2 } from "lucide-react"


export function AddPenaltyForm({
    groupId,
    members,
    onSuccess,
    onClose,
}: AddPenaltyFormProps) {
    const { t } = useTranslation()
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [isPending, setIsPending] = useState(false)
    const [userId, setUserId] = useState<string>("")
    const [type, setType] = useState<string>("")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setFieldErrors({})
        setIsPending(true)

        const form = e.currentTarget
        const amountInput = (form.elements.namedItem("amount") as HTMLInputElement).value.trim()

        const rawFormData = {
            userId,
            amount: amountInput,
            type,
        }

        const result = addPenaltySchema.safeParse(rawFormData)

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
            await addPenalty(groupId, {
                memberId: result.data.userId,
                amount: result.data.amount,
                type: result.data.type,
            })
            setUserId("")
            setType("")
            onSuccess?.()
            onClose()
        } catch (err: unknown) {
            let message = "Failed to add penalty"
            if (err && typeof err === "object" && "response" in err) {
                const res = (err as { response?: { data?: { message?: string } } }).response
                message = res?.data?.message ?? message
            } else if (err instanceof Error) {
                message = err.message
            }
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
                <Label htmlFor="userId">{t("contributions.member")}</Label>
                <Select value={userId} onValueChange={setUserId}>
                    <SelectTrigger id="userId" aria-invalid={!!fieldErrors.userId}>
                        <SelectValue placeholder={t("common.selectMember")} />
                    </SelectTrigger>
                    <SelectContent>
                        {members.map((member) => (
                            <SelectItem
                                key={member.id}
                                value={String(member.userId)}
                            >
                                {member.user.firstName} {member.user.lastName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {fieldErrors.userId && (
                    <p className="text-sm text-destructive">{fieldErrors.userId}</p>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="amount">{t("contributions.amountTzs")}</Label>
                <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 50000"
                    aria-invalid={!!fieldErrors.amount}
                />
                {fieldErrors.amount && (
                    <p className="text-sm text-destructive">{fieldErrors.amount}</p>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="type">{t("common.type")}</Label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type" aria-invalid={!!fieldErrors.type}>
                        <SelectValue placeholder={t("common.selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                        {PENALTY_TYPES.map((value) => (
                            <SelectItem key={value} value={value}>
                                {t(`penalties.types.${value}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {fieldErrors.type && (
                    <p className="text-sm text-destructive">{fieldErrors.type}</p>
                )}
            </div>
            <DialogFooter className="gap-3 sm:gap-3 pt-2">
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isPending}>
                        {t("common.cancel")}
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("common.adding")}
                        </>
                    ) : (
                        t("penalties.addPenaltyButton")
                    )}
                </Button>
            </DialogFooter>
        </form>
    )
}
