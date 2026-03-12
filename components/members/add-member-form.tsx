"use client"

import { useState } from "react"
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
import { addMember } from "@/app/home/members/_action"
import { addMemberSchema, ADD_MEMBER_TITLES } from "@/lib/zod"
import { AddMemberFormProps } from "@/interfaces/interface"

const MEMBER_ROLES = ADD_MEMBER_TITLES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}))

type MemberRole = (typeof ADD_MEMBER_TITLES)[number]

export function AddMemberForm({ groupId, onSuccess, onClose }: AddMemberFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)
  const [title, setTitle] = useState<MemberRole | "">("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsPending(true)

    const form = e.currentTarget
    const firstName = (form.elements.namedItem("firstName") as HTMLInputElement).value
    const lastName = (form.elements.namedItem("lastName") as HTMLInputElement).value
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value

    const rawFormData = { firstName, lastName, phone, title }
    const result = addMemberSchema.safeParse(rawFormData)

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

    const { title: validatedTitle, ...rest } = result.data
    const apiData = { ...rest, title: validatedTitle.toUpperCase() as "CHAIRPERSON" | "TREASURER" | "SECRETARY" | "MEMBER" }

    try {
      await addMember(groupId, apiData)
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      let message = "Failed to add member"
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
        <Label htmlFor="firstName">First name</Label>
        <Input
          id="firstName"
          name="firstName"
          placeholder="e.g. John"
          aria-invalid={!!fieldErrors.firstName}
        />
        {fieldErrors.firstName && (
          <p className="text-sm text-destructive">{fieldErrors.firstName}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lastName">Last name</Label>
        <Input
          id="lastName"
          name="lastName"
          placeholder="e.g. Doe"
          aria-invalid={!!fieldErrors.lastName}
        />
        {fieldErrors.lastName && (
          <p className="text-sm text-destructive">{fieldErrors.lastName}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="e.g. +255712345678"
          aria-invalid={!!fieldErrors.phone}
        />
        {fieldErrors.phone && (
          <p className="text-sm text-destructive">{fieldErrors.phone}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Select value={title} onValueChange={(v) => setTitle(v as MemberRole)}>
          <SelectTrigger id="title" aria-invalid={!!fieldErrors.title}>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {MEMBER_ROLES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.title && (
          <p className="text-sm text-destructive">{fieldErrors.title}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="file">Profile photo (optional)</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept="image/*,.pdf"
          className="cursor-pointer"
        />
      </div>
      <DialogFooter className="gap-4 sm:gap-4 pt-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending} className="cursor-pointer">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending} className="cursor-pointer">
          {isPending ? "Adding…" : "Add member"}
        </Button>
      </DialogFooter>
    </form>
  )
}
