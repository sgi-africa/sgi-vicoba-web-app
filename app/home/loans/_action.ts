'use server'

import { api } from "@/lib/api"
import { auth } from "@/auth"
import {
  AddLoanPayload,
  LoanRepaymentSummary,
  LoanRequest,
} from "@/interfaces/interface"

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

export async function getLoans(groupId: number): Promise<LoanRequest[]> {
  const session = await auth()

  if (!session?.user.accessToken) {
    throw new Error("Not authenticated")
  }

  const response = await api.get(`/loans/group/${groupId}`, {
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  })

  return response.data ?? []
}

export async function repayLoan(
  groupId: number,
  loanId: number,
  amount: number
): Promise<LoanRepaymentSummary> {
  const session = await auth()

  if (!session?.user.accessToken) {
    throw new Error("Not authenticated")
  }

  const response = await api.post(
    `/loans/group/${groupId}/loan/${loanId}/repay`,
    { amount },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    }
  )

  return response.data as LoanRepaymentSummary
}
