import {ApiError} from "./ApiError.ts";

const API_URL = import.meta.env.VITE_API_URL;

export type LoginResponse = {
    token: string;
}

export type RegisterResponse = {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
    })

    if (!response.ok) {
        throw new ApiError(response.status, 'Login failed', null);
    }

    return response.json();
}

export const register = async (name: string, email: string, password: string): Promise<RegisterResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, password}),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new ApiError(response.status, data.error, data.details);
    }

    return data;
}