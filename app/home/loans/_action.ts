'use server'

import { api } from "@/lib/api"
import { auth } from "@/auth"
import { AddLoanPayload } from "@/interfaces/interface"

export async function addLoan(groupId: number, data: AddLoanPayload) {
  const session = await auth()

  if (!session?.user.accessToken) {
    throw new Error("Not authenticated")
  }

  const response = await api.post(`/loans/new/${groupId}`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  })

  return response.data
}
