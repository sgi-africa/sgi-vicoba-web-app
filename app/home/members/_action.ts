'use server'

import { api } from "@/lib/api"
import { Member } from "@/interfaces/interface"
import { auth } from "@/auth"


export async function addMember(groupId: number, formData: FormData) {
    const session = await auth();

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated");
    }

    const response = await api.post(`/members/add/${groupId}`, formData, {
        headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
        },
    })

    return response.data
}

export async function getMembers(groupId: number): Promise<Member[]> {
    const session = await auth();

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated");
    }

    try {
        const response = await api.get(`/members/list/${groupId}`, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });

        return response.data ?? [];
    } catch (error) {
        console.error("Members fetch error:", error);
        return [];
    }
}