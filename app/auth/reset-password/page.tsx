import { AuthLegalFooter } from "@/components/auth/auth-legal-footer"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { ResetPassword } from "@/components/auth/reset-password"

export default function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const tokenParam = searchParams?.token
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam

  return (
    <AuthPageShell>
      <ResetPassword token={token} />
      <AuthLegalFooter />
    </AuthPageShell>
  )
}
