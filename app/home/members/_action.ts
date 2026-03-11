'use server'

import { api } from "@/lib/api"

export async function addMember(groupId: number, formData: FormData) {
    const data = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        phone: formData.get("phone") as string,
        title: formData.get("title") as "chairperson" | "treasurer" | "secretary" | "member",
        file: formData.get("file") as File | null,
    }

    const payload = new FormData()
    payload.append("firstName", data.firstName)
    payload.append("lastName", data.lastName)
    payload.append("phone", data.phone)
    payload.append("title", data.title)
    if (data.file && data.file.size > 0) {
        payload.append("file", data.file)
    }

    const response = await api.post(`/groups/add/${groupId}`, payload)

    return response.data
}
