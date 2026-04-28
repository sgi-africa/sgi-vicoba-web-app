/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import registerUser from "@/app/auth/register/_action"
import { useState } from "react"
import { toast } from 'sonner'
import { useRouter } from "next/navigation"
import "react-phone-number-input/style.css"
import PhoneInput from "react-phone-number-input"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema } from "@/lib/zod"
import type { output } from "zod"
import { Trans, useTranslation } from "react-i18next"
import { Loader2 } from "lucide-react"

type RegisterFormValues = output<typeof registerSchema>

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: undefined,
      password: "",
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true)
    const formData = new FormData()
    formData.set("firstName", data.firstName)
    formData.set("lastName", data.lastName)
    formData.set("email", data.email)
    formData.set("password", data.password)
    if (data.phone) formData.set("phone", data.phone)

    try {
      await registerUser(formData)
      router.push("/auth/login")
      toast.success(t("notifications.registeredSuccess"))
    } catch (error: any) {
      toast.error(error.message || t("notifications.registrationFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-sm border-border/60">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">{t("auth.registerWelcome")}</CardTitle>
          <CardDescription>{t("auth.registerDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register("firstName")}
                  aria-invalid={!!errors.firstName}
                  className="h-10"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register("lastName")}
                  aria-invalid={!!errors.lastName}
                  className="h-10"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="johndoe@gmail.com"
                {...register("email")}
                aria-invalid={!!errors.email}
                className="h-10"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("auth.phoneNumber")}</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    international
                    defaultCountry="TZ"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. 712 345 678"
                    id="phone"
                    ref={field.ref}
                    className="phone-input-wrapper"
                  />
                )}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                aria-invalid={!!errors.password}
                className="h-10"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.signingUp")}
                </>
              ) : (
                t("auth.signUpButton")
              )}
            </Button>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              <Trans
                i18nKey="auth.registerPrivacyAcknowledgement"
                components={[
                  <Link
                    key="privacy"
                    href="/legal/privacy-policy"
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  />,
                ]}
              />
            </p>
            <p className="text-center text-sm text-muted-foreground">
              {t("auth.alreadyAccount")}{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {t("auth.signUpHere")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
