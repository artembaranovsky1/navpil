import {ApiError} from "./ApiError.ts";

const API_URL = import.meta.env.VITE_API_URL;

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {

    const token = localStorage.getItem('token');
    const headers = new Headers(options.headers);

    headers.set('Content-Type', 'application/json');

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }


    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })

    const data = await response.json();

    if (!response.ok) {

        throw new ApiError(
            response.status,
            data.error,
            data.details,
        );
    }
    return data;
}