import { RegisterForm } from "@/components/auth/register-form"
import { AuthPageShell } from "@/components/auth/auth-page-shell"

export default function Page() {
  return (
    <AuthPageShell>
      <RegisterForm />
    </AuthPageShell>
  )
}
