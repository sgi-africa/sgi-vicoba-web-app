'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { toast } from 'sonner'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signInSchema } from "@/lib/zod"
import type { output } from "zod"
import { useTranslation } from "react-i18next"
import { Loader2 } from "lucide-react"

type SignInFormValues = output<typeof signInSchema>

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const callbackUrl = "/home"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: SignInFormValues) => {
    setLoading(true)

    try {
      const results = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      })
      if (results?.error) {
        console.error("Login failed:", results.error)
        toast.error(t("notifications.wrongCredentials"))
      } else {
        window.location.href = callbackUrl
        toast.success(t("notifications.welcomeBack"))
      }
    } catch (error) {
      console.error("Sign-in error:", error)
      toast.error(t("notifications.loginFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-sm border-border/60">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">{t("auth.loginTitle")}</CardTitle>
          <CardDescription>{t("auth.loginDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="johndoe@gmail.com"
                disabled={loading}
                {...register("email")}
                aria-invalid={!!errors.email}
                className="h-10"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link
                  href="/auth/forgot-password"
                  className="ml-auto text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                disabled={loading}
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
                  {t("auth.signingIn")}
                </>
              ) : (
                t("auth.signIn")
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("auth.noAccount")}{" "}
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {t("auth.signUp")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
