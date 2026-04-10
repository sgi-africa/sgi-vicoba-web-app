import { Shield } from "lucide-react"
import Link from "next/link"
import { ResetPassword } from "@/components/auth/reset-password"

export default function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const tokenParam = searchParams?.token
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-dark text-white">
              <Shield className="size-4" />
            </div>
            <span className="font-semibold text-foreground tracking-tight text-lg">
              SGI VICOBA
            </span>
          </Link>
        </div>
        <ResetPassword token={token} />
      </div>
    </div>
  )
}
