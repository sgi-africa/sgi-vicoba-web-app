import axios from "axios";
import { SERVER_URI } from "@/constants/constant";
import { auth, signOut } from "@/auth";

export const api = axios.create({
    baseURL: `${SERVER_URI}/api/v1`,
});

// Request interceptor: attach the latest token
api.interceptors.request.use(async (config) => {
    const session = await auth(); // always get latest session
    const token = session?.user?.accessToken;

    if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
});

// Response interceptor: just log the refreshed token
api.interceptors.response.use(
    (response) => {
        const refreshed = response.headers["x-refreshed-token"];

        if (refreshed) {
            console.log("refreshed token:", refreshed);
        }

        return response;
    },
    async (error) => {
        // if (axios.isAxiosError(error) && error.response?.status === 401) {
        //     await signOut({ redirectTo: "/auth/login" });
        // }
        return Promise.reject(error);
    }
);