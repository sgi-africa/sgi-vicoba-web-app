'use server'

import { api } from "@/lib/api"
import { auth } from "@/auth"

export default async function createGroups() {
    const session = await auth();

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated");
    }

    const response = await api.post("/groups/create",{}, {
        headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
        },
    });

    return response.data;
}