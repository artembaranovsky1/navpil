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
    inviteCode: string
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

export const getTrip = async (tripId: string): Promise<TripResponse> => {
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

export const joinTrip = async (code: string): Promise<TripResponse> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({code})
    })

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.error ?? 'join failed', data.details);
    }

    return data;
}

export const removeMember = async (tripId: string, userId: string): Promise<void> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms/${tripId}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new ApiError(response.status, data.error ?? 'remove member failed', data.details);
    }
}


export type TripSummary = {
    // скільки витратили всі разом
    total: number;
    // скільки ще мають повернути тобі (+) чи маєш віддати ти (−)
    myBalance: number;
}

export type TripsSummaryResponse = {
    myBalance: number;
    totalSpent: number;
    tripsThisYear: number;
    trips: Record<string, TripSummary>;
}

export const getTripsSummary = async (): Promise<TripsSummaryResponse> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms/summary`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new ApiError(response.status, 'get trips summary failed', null);
    }

    return response.json();
}
