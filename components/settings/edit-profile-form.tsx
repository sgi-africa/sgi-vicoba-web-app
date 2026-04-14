"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import "react-phone-number-input/style.css"
import PhoneInput from "react-phone-number-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateMe } from "@/app/home/settings/_action"
import { updateMeSchema } from "@/lib/zod"
import { EditProfileFormProps } from "@/interfaces/interface"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

/** Backend returns this in English; map to i18n when the locale is not English. */
const WRONG_CURRENT_PASSWORD_EN = /^current password is incorrect\.?$/i

function localizeProfileApiMessage(message: string, translate: (key: string) => string): string {
  const trimmed = message.trim()
  if (WRONG_CURRENT_PASSWORD_EN.test(trimmed)) {
    return translate("settings.wrongCurrentPassword")
  }
  return trimmed
}

export function EditProfileForm({ member, onSuccess, className }: EditProfileFormProps) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)
  const [phone, setPhone] = useState<string | undefined>(() => member.phone || undefined)

  useEffect(() => {
    setPhone(member.phone || undefined)
  }, [member.id, member.phone])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsPending(true)

    const form = e.currentTarget
    const currentPasswordRaw = (form.elements.namedItem("currentPassword") as HTMLInputElement).value.trim()
    const passwordRaw = (form.elements.namedItem("password") as HTMLInputElement).value.trim()

    const rawFormData = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value.trim(),
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      phone: (phone ?? "").trim(),
      currentPassword: currentPasswordRaw || undefined,
      password: passwordRaw || undefined,
    }

    const result = updateMeSchema.safeParse(rawFormData)

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
      const updateResult = await updateMe(result.data)
      if (updateResult.ok) {
        const updated = updateResult.user
        onSuccess?.(updated)
        ;(form.elements.namedItem("firstName") as HTMLInputElement).value = updated.firstName
        ;(form.elements.namedItem("lastName") as HTMLInputElement).value = updated.lastName
        ;(form.elements.namedItem("email") as HTMLInputElement).value = updated.email ?? ""
        setPhone(updated.phone || undefined)
        ;(form.elements.namedItem("currentPassword") as HTMLInputElement).value = ""
        ;(form.elements.namedItem("password") as HTMLInputElement).value = ""
      } else {
        const attemptedPasswordChange = Boolean(passwordRaw)
        const message =
          localizeProfileApiMessage(
            updateResult.message.trim() || t("settings.profileUpdateFailed"),
            t
          )
        const fieldErrs: Record<string, string> = {}
        if (attemptedPasswordChange) {
          fieldErrs.currentPassword = message
        }

        setFieldErrors((prev) => ({ ...prev, ...fieldErrs }))
        setError(message)
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg" role="alert">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="profile-firstName">{t("auth.firstName")}</Label>
          <Input
            id="profile-firstName"
            name="firstName"
            defaultValue={member.firstName}
            autoComplete="given-name"
            aria-invalid={!!fieldErrors.firstName}
            className="h-10"
          />
          {fieldErrors.firstName && (
            <p className="text-sm text-destructive">{fieldErrors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-lastName">{t("auth.lastName")}</Label>
          <Input
            id="profile-lastName"
            name="lastName"
            defaultValue={member.lastName}
            autoComplete="family-name"
            aria-invalid={!!fieldErrors.lastName}
            className="h-10"
          />
          {fieldErrors.lastName && (
            <p className="text-sm text-destructive">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-email">{t("auth.email")}</Label>
        <Input
          id="profile-email"
          name="email"
          type="email"
          defaultValue={member.email ?? ""}
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
          className="h-10"
        />
        {fieldErrors.email && (
          <p className="text-sm text-destructive">{fieldErrors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-phone">{t("auth.phoneNumber")}</Label>
        <PhoneInput
          international
          defaultCountry="TZ"
          value={phone}
          onChange={setPhone}
          placeholder="e.g. 712 345 678"
          id="profile-phone"
          className="phone-input-wrapper"
          aria-invalid={!!fieldErrors.phone}
        />
        {fieldErrors.phone && (
          <p className="text-sm text-destructive">{fieldErrors.phone}</p>
        )}
      </div>

      <div className="pt-2 border-t border-border/60 space-y-4">
        <p className="text-sm text-muted-foreground">{t("settings.passwordChangeHint")}</p>
        <div className="space-y-2">
          <Label htmlFor="profile-currentPassword">{t("settings.currentPassword")}</Label>
          <Input
            id="profile-currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!fieldErrors.currentPassword}
            className="h-10"
          />
          {fieldErrors.currentPassword && (
            <p className="text-sm text-destructive">{fieldErrors.currentPassword}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-password">{t("settings.newPassword")}</Label>
          <Input
            id="profile-password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!fieldErrors.password}
            className="h-10"
          />
          {fieldErrors.password && (
            <p className="text-sm text-destructive">{fieldErrors.password}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("settings.saving")}
          </>
        ) : (
          t("settings.saveChanges")
        )}
      </Button>
    </form>
  )
}
