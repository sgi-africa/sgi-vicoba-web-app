/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import axios from "axios"
import { SERVER_URI } from "@/constants/constant"
import { ResetPasswordPayload } from "@/interfaces/interface";

export default async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
    try {
        await axios.post(`${SERVER_URI}/api/v1/auth/reset-password/complete`, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });

    } catch (error: any) {
        const backendMsg = error?.response?.data?.message

        const errorMessage =
            backendMsg || error?.message || "Failed to reset password"

        console.error("Reset Password Error:", errorMessage)

        throw new Error(errorMessage)
    }
}