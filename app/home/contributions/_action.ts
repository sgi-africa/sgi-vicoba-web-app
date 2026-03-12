'use server'

import { api } from "@/lib/api"
import { auth } from "@/auth"
import { Contribution } from "@/interfaces/interface"

export async function getContributions(groupId: number): Promise<Contribution[]> {
    const session = await auth()

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated")
    }

    try {
        const response = await api.get(`/contributions/group/${groupId}`, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        })
        const all = response.data ?? []
        return all.filter((c: Contribution) => c.type !== "PENALTY")
    } catch (error) {
        console.error("Contributions fetch error:", error)
        return []
    }
}

export async function addContribution(
    groupId: number,
    data: { userId: number; amount: number; type: "SAVINGS" | "JAMII" | "PENALTY" }
) {
    const session = await auth()

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated")
    }

    const response = await api.post(`/contributions/new/${groupId}`, data,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        }
    )

    return response.data
}
