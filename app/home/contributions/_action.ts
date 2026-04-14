'use server'

import axios from "axios"
import { api } from "@/lib/api"
import { auth } from "@/auth"
import { getAxiosErrorUserMessage } from "@/lib/getAxiosErrorMessage"
import { Contribution } from "@/interfaces/interface"

export type AddContributionResult = | { ok: true; data: Contribution } | { ok: false; message: string }

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
    data: { userId: number; amount: number; type: "SAVINGS" | "JAMII" | "PENALTY"; penaltyId?: number }
): Promise<AddContributionResult> {
    const session = await auth()

    if (!session?.user.accessToken) {
        return { ok: false, message: "Not authenticated. Please sign in again." }
    }

    try {
        const response = await api.post<Contribution>(`/contributions/new/${groupId}`, data, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        })

        const payload = response.data
        if (!payload) {
            return { ok: false, message: "Failed to add contribution" }
        }
        return { ok: true, data: payload }
    } catch (error) {
        console.error("Add contribution error:", error)
        if (axios.isAxiosError(error)) {
            const msg = getAxiosErrorUserMessage(error) || "Failed to add contribution"
            return { ok: false, message: msg }
        }
        return {
            ok: false,
            message: error instanceof Error ? error.message : "Failed to add contribution",
        }
    }
}
