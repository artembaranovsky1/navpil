import {ApiError} from "./ApiError.ts";

export type TripMember = {
    id: string
    name: string
    role: 'owner' | 'member'
}

export type TripStatus = 'active' | 'upcoming' | 'past';


export type TripResponse = {
    id: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    members: TripMember[];
    status: TripStatus;
}

export type TripsResponse = {
    active: TripResponse[];
    upcoming: TripResponse[];
    past: TripResponse[];
};

export const flattenTrips = ({active, upcoming, past}: TripsResponse): TripResponse[] =>
    [...active, ...upcoming, ...past];

export type CreateTripData = {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const getTrips = async (): Promise<TripsResponse> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new ApiError(response.status, 'get trips failed', null);
    }

    return response.json();
}

export const getTrip = async (tripId): Promise<TripsResponse> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.error ?? 'get trip failed', data.details);
    }

    return data;
}

export const createTrip = async (tripData: CreateTripData): Promise<TripResponse>  => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
    })

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.error ?? 'createTrip failed', data.details);
    }

    return data;
}
