"use client"

import { useState } from "react"
import "react-phone-number-input/style.css"
import PhoneInput from "react-phone-number-input"
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
import { addMember } from "@/app/home/members/_action"
import { addMemberSchema, ADD_MEMBER_TITLES } from "@/lib/zod"
import { AddMemberFormProps } from "@/interfaces/interface"
import { memberTitleRequiresEmail } from "@/utils/members/members"
import { Loader2 } from "lucide-react"


type MemberRole = (typeof ADD_MEMBER_TITLES)[number]

export function AddMemberForm({ groupId, onSuccess, onClose }: AddMemberFormProps) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)
  const [title, setTitle] = useState<MemberRole | "">("")
  const [phone, setPhone] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsPending(true)

    const form = e.currentTarget
    const firstName = (form.elements.namedItem("firstName") as HTMLInputElement).value
    const lastName = (form.elements.namedItem("lastName") as HTMLInputElement).value
    const uploadInput = form.elements.namedItem("upload") as HTMLInputElement | null
    const upload = uploadInput?.files?.[0]
    const file = upload?.type === "application/pdf" ? upload : undefined
    const image = upload?.type?.startsWith("image/") ? upload : undefined

    const rawFormData = { firstName, lastName, phone: phone ?? "", title, email, file, image }
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

    const { title: validatedTitle, file: fileObj, image: imageObj, ...rest } = result.data
    const apiTitle = validatedTitle.toUpperCase() as "CHAIRPERSON" | "TREASURER" | "SECRETARY" | "MEMBER"

    const formData = new FormData()
    formData.append("firstName", rest.firstName)
    formData.append("lastName", rest.lastName)
    formData.append("phone", rest.phone)
    formData.append("title", apiTitle)
    formData.append("email", (rest.email ?? "").trim())
    if (fileObj) formData.append("file", fileObj)
    if (imageObj) formData.append("image", imageObj)

    try {
      await addMember(groupId, formData)
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
        <Label htmlFor="firstName">{t("members.firstName")}</Label>
        <Input
          id="firstName"
          name="firstName"
          placeholder={t("members.firstNamePlaceholder")}
          aria-invalid={!!fieldErrors.firstName}
        />
        {fieldErrors.firstName && (
          <p className="text-sm text-destructive">{fieldErrors.firstName}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lastName">{t("members.lastName")}</Label>
        <Input
          id="lastName"
          name="lastName"
          placeholder={t("members.lastNamePlaceholder")}
          aria-invalid={!!fieldErrors.lastName}
        />
        {fieldErrors.lastName && (
          <p className="text-sm text-destructive">{fieldErrors.lastName}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">{t("members.phone")}</Label>
        <PhoneInput
          international
          defaultCountry="TZ"
          value={phone}
          onChange={setPhone}
          placeholder={t("members.phonePlaceholder")}
          id="phone"
          className="phone-input-wrapper"
          aria-invalid={!!fieldErrors.phone}
        />
        {fieldErrors.phone && (
          <p className="text-sm text-destructive">{fieldErrors.phone}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title">{t("members.title")}</Label>
        <Select
          value={title}
          onValueChange={(v) => {
            const next = v as MemberRole
            setTitle(next)
            if (!memberTitleRequiresEmail(next)) setEmail("")
          }}
        >
          <SelectTrigger id="title" aria-invalid={!!fieldErrors.title}>
            <SelectValue placeholder={t("members.selectRole")} />
          </SelectTrigger>
          <SelectContent>
            {ADD_MEMBER_TITLES.map((value) => (
              <SelectItem key={value} value={value}>
                {t(`members.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.title && (
          <p className="text-sm text-destructive">{fieldErrors.title}</p>
        )}
      </div>
      {memberTitleRequiresEmail(title) && (
        <div className="grid gap-2">
          <Label htmlFor="email">{t("members.email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t("members.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && (
            <p className="text-sm text-destructive">{fieldErrors.email}</p>
          )}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="upload">{t("members.memberUploadLabel")}</Label>
        <Input
          id="upload"
          name="upload"
          type="file"
          accept="application/pdf,.pdf,image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="cursor-pointer"
          aria-invalid={!!fieldErrors.file || !!fieldErrors.image}
        />
        <p className="text-sm text-muted-foreground">{t("members.memberUploadHint")}</p>
        {(fieldErrors.file || fieldErrors.image) && (
          <p className="text-sm text-destructive">{fieldErrors.file || fieldErrors.image}</p>
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
            t("members.addMemberButton")
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
