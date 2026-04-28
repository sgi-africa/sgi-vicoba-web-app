import { LoginForm } from "@/components/auth/login-form"
import { AuthLegalFooter } from "@/components/auth/auth-legal-footer"
import { AuthPageShell } from "@/components/auth/auth-page-shell"

export default function Page() {
  return (
    <AuthPageShell>
      <LoginForm />
      <AuthLegalFooter />
    </AuthPageShell>
  )
}
