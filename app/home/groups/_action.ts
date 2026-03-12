'use server'

import { api } from "@/lib/api"
import { auth } from "@/auth"
import { CreateGroupFormValues } from "@/lib/zod"
import { GroupResponse } from "@/interfaces/interface"

export default async function createGroup(data: CreateGroupFormValues): Promise<GroupResponse> {
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
        ...(data.description && { description: data.description }),
        ...(data.type && { type: data.type }),
    }

    const response = await api.post("/groups/create", payload, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.accessToken}`,
        },
    })

    return response.data
}