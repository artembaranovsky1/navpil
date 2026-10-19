import {ApiError} from "@/api/ApiError";
import {authHeaders} from "@/api/helper";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type User = {
    id: string;
    name: string;
    email: string;
}

export const getMe = async (): Promise<User> => {
    const response = await fetch(`${API_URL}/users/me`, {
        headers: await authHeaders(),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(response.status, data?.error ?? 'Request failed', data?.details ?? null);
    }

    return data;
}