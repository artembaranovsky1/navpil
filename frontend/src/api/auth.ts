import {ApiError} from "./ApiError.ts";

const API_URL = import.meta.env.VITE_API_URL;

export type LoginResponse = {
    token: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
    })

    if (!response.ok) {
        throw new ApiError(response.status, 'Login failed', null);
    }

    return response.json();
}
