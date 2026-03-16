'use server'

import { api } from "@/lib/api"
import { auth } from "@/auth"
import { GroupResponse } from "@/interfaces/interface"
import { UpdateGroupFormValues } from "@/lib/zod"

export async function getGroup(groupId: number): Promise<GroupResponse | null> {
    const session = await auth();

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated");
    }

    try {
        const response = await api.get(`/groups/${groupId}`, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });

        return response.data ?? null;
    } catch (error) {
        console.error("Group fetch error:", error);
        return null;
    }
}

export async function updateGroup(groupId: number, data: UpdateGroupFormValues): Promise<GroupResponse | null> {
    const session = await auth();

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated");
    }

    const payload = {
        name: data.name,
        country: data.country,
        city: data.city,
        region: data.region,
        street: data.street,
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.type && { type: data.type }),
    };

    try {
        const response = await api.put(`/groups/${groupId}`, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });

        return response.data ?? null;
    } catch (error) {
        console.error("Group update error:", error);
        throw error;
    }
}
