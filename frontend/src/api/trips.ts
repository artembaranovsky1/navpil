import {ApiError} from "./ApiError.ts";

export type TripResponse = {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const getTrips = async (): Promise<TripResponse[]> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new ApiError(response.status, 'get trips failed', null);
    }

    return response.json();
}

export const createTrip = async (name: string, description?: string): Promise<TripResponse>  => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({name, description}),
    })

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.error ?? 'createTrip failed', data.details);
    }

    return data;
}