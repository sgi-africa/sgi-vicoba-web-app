'use server'

import { api } from "@/lib/api"
import { auth } from "@/auth"
import { AddMeetingPayload, GroupMeetingsResponse } from "@/interfaces/interface";

export async function addMeeting(groupId: number, payload: AddMeetingPayload) {
    const session = await auth();

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated");
    }

    const response = await api.post(`/meetings/new/${groupId}`, payload)
    return response.data
}


export async function getGroupMeetings(groupId: number): Promise<GroupMeetingsResponse[]> {
    const session = await auth();

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated");
    }

    try {
        const response = await api.get(`/meetings/group/${groupId}`)
        const data = response.data
        return Array.isArray(data) ? data : []
    } catch {
        return []
    }
}