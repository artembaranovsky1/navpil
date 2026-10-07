import {ApiError} from "./ApiError.ts";

const API_URL = import.meta.env.VITE_API_URL;

export type User = {
    name: string;
    email: string;
}

export const getMe = async (): Promise<User> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new ApiError(response.status, 'get me failed', null);
    }

    return response.json();
}
