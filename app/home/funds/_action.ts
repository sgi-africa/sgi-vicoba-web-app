'use server'

import { api } from "@/lib/api"
import { auth } from "@/auth"
import { ProfitDistribution, ProfitSnapshot } from "@/interfaces/interface"
import { parseProfitSnapshotList } from "@/utils/funds/parseProfitSnapshots"

export async function getDisbursementSnapshots(groupId: number): Promise<ProfitSnapshot[]> {
  const session = await auth()

  if (!session?.user.accessToken) {
    throw new Error("Not authenticated")
  }

  try {
    const response = await api.get(`/disbursements/groups/${groupId}/disbursement-snapshot`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    })
    const list = parseProfitSnapshotList(response.data)
    return [...list].sort((a, b) => {
      const tb = new Date(b.executedAt).getTime()
      const ta = new Date(a.executedAt).getTime()
      return (Number.isFinite(tb) && Number.isFinite(ta) ? tb - ta : 0)
    })
  } catch {
    return []
  }
}

export async function disburseGroupFunds(groupId: number): Promise<ProfitDistribution> {
  const session = await auth()

  if (!session?.user.accessToken) {
    throw new Error("Not authenticated")
  }

  const response = await api.post(
    `/disbursements/groups/${groupId}/disburse`,
    {},
    {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    }
  )

  return response.data as ProfitDistribution
}
