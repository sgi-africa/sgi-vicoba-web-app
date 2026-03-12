'use server'

import { api } from "@/lib/api"
import { auth } from "@/auth"
import { GroupSharesResponse, MemberSharesResponse } from "@/interfaces/interface"

export async function getGroupShares(groupId: number): Promise<GroupSharesResponse | null> {
    const session = await auth()

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated")
    }

    try {
        const response = await api.get(`/shares/group/${groupId}`, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        })
        return response.data
    } catch (error) {
        console.error("Shares fetch error:", error)
        return null
    }
}

export async function getMemberShares(
    groupId: number,
    userId: number
): Promise<MemberSharesResponse | null> {
    const session = await auth()

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated")
    }

    try {
        const response = await api.get(`/shares/group/${groupId}/member/${userId}`, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        })
        return response.data
    } catch (error) {
        console.error("Member shares fetch error:", error)
        return null
    }
}

export async function addShares(
    groupId: number,
    data: { totalShares: number; sharePrice: number }
) {
    const session = await auth()

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated")
    }

    const response = await api.post(`/shares/add-shares/${groupId}`, data, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.accessToken}`,
        },
    })

    return response.data
}