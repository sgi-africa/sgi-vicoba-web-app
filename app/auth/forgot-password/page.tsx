import { ForgotPassword } from "@/components/auth/forgot-password"
import { AuthLegalFooter } from "@/components/auth/auth-legal-footer"
import { AuthPageShell } from "@/components/auth/auth-page-shell"

export default function Page() {
  return (
    <AuthPageShell>
      <ForgotPassword />
      <AuthLegalFooter />
    </AuthPageShell>
  )
}
