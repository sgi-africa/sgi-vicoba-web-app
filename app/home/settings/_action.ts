'use server'

import axios from "axios"
import { api } from "@/lib/api"
import { auth } from "@/auth"
import { AuthMeResponse, GroupResponse, MemberUser } from "@/interfaces/interface"
import { getAxiosErrorUserMessage } from "@/lib/getAxiosErrorMessage"
import { UpdateGroupFormValues, UpdateMeFormValues } from "@/lib/zod"

export type UpdateMeResult = | { ok: true; user: MemberUser } | { ok: false; message: string }

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
        const response = await api.patch(`/groups/${groupId}`, payload, {
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

export async function getMe(): Promise<MemberUser | null> {
    const session = await auth();

    if (!session?.user.accessToken) {
        throw new Error("Not authenticated");
    }

    try {
        const response = await api.get<AuthMeResponse>("/auth/me", {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });

        return response.data?.user ?? null;
    } catch (error) {
        console.error("Me fetch error:", error);
        return null;
    }
}

export async function updateMe(data: UpdateMeFormValues): Promise<UpdateMeResult> {
    const session = await auth();

    if (!session?.user.accessToken) {
        return { ok: false, message: "Not authenticated. Please sign in again." };
    }

    const newPassword = data.password?.trim() ?? ""
    const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        ...(newPassword.length > 0
            ? {
                password: newPassword,
                currentPassword: data.currentPassword?.trim() ?? "",
            }
            : {}),
    }

    try {
        const response = await api.patch("/auth/update-profile", payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });

        const user = response.data?.user ?? null;
        if (!user) {
            return { ok: false, message: "Profile update failed" };
        }
        return { ok: true, user };
    } catch (error) {
        console.error("Me update error:", error);

        if (axios.isAxiosError(error)) {
            const msg = getAxiosErrorUserMessage(error) || "Profile update failed";
            return { ok: false, message: msg };
        }

        return {
            ok: false,
            message: error instanceof Error ? error.message : "Profile update failed",
        };
    }
}