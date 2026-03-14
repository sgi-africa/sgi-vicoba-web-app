'use server'

import { api } from "@/lib/api"
import { auth } from "@/auth"
import { AddMeetingPayload } from "@/interfaces/interface";

export async function addMeeting(groupId: number, payload: AddMeetingPayload) {
    const session = await auth();

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated");
    }

    const response = await api.post(`/meetings/new/${groupId}`, payload)
    return response.data
}
