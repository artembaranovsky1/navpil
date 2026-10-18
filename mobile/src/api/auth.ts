import {ApiError} from "@/api/ApiError";
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, 'Login failed', null);
    }

    return data;
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