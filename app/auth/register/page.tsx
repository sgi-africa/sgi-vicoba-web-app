import { RegisterForm } from "@/components/auth/register-form"
import { Shield } from "lucide-react"
import Link from "next/link"

export default function Page() {
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
        <RegisterForm />
      </div>
    </div>
  )
}
