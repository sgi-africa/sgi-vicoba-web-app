/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { SERVER_URI } from "@/constants/constant"
import axios from "axios"

export default async function forgotPassword(email: string): Promise<void> {
    try {
        const payload: Record<string, string> = { email }

        await axios.post(`${SERVER_URI}/api/v1/auth/reset-password`, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });

    } catch (error: any) {
        const backendMsg = error?.response?.data?.message

        const errorMessage =
            backendMsg || error?.message || "Failed to send reset link"

        console.error("Forgot Password Error:", errorMessage)

        throw new Error(errorMessage)
    }
}