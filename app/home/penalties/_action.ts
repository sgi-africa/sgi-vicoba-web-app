'use server'

import { api } from "@/lib/api"
import { auth } from "@/auth"
import { Penalty } from "@/interfaces/interface"

export async function getPenalties(groupId: number): Promise<Penalty[]> {
    const session = await auth()

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated")
    }

    try {
        const response = await api.get(`/penalties/group/${groupId}`, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        })
        return response.data ?? []
    } catch (error) {
        console.error("Penalties fetch error:", error)
        return []
    }
}

export async function addPenalty(
    groupId: number,
    data: { memberId: number; amount: number; type: "ABSENT" | "LATE" | "MISCONDUCT" | "OTHER" }
) {
    const session = await auth()

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated")
    }

    const { memberId, ...body } = data
    const response = await api.post(`/penalties/add-penalty/${groupId}/${memberId}`, body,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        }
    )

    return response.data
}
