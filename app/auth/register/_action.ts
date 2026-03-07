/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { SERVER_URI } from "@/constants/constant"
import axios from "axios"

export default async function registerUser(formData: FormData): Promise<void> {

    const name = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
        const response = await axios.post(`${SERVER_URI}/api/v1/auth/register`, {
            name,
            email,
            password
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });

    } catch (error: any) {
        const status = error?.response?.status
        const backendMsg = error?.response?.data?.message

        let errorMessage = "Something went wrong"

        if (status === 403) {
            errorMessage = "Email already exists!"
        } else if (backendMsg) {
            errorMessage = backendMsg
        } else if (error?.message) {
            errorMessage = error.message
        }
        console.error("Registration Error:", errorMessage)
        throw new Error(errorMessage)
    }
}