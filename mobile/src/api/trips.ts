import {ApiError} from "@/api/ApiError";
import {authHeaders} from "@/api/helper";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

export type CreateTripData = {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(response.status, data?.error ?? 'Request failed', data?.details ?? null);
    }

    return data as T;
};

export const getTrips = async (): Promise<TripsResponse> => {
    const response = await fetch(`${API_URL}/rooms`, {
        headers: await authHeaders()
    });

    return handleResponse<TripsResponse>(response);
}

export const createTrip = async (tripData: CreateTripData): Promise<TripResponse> => {

    const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(await authHeaders()),
        },
        body: JSON.stringify(tripData),
    })

    return handleResponse<TripResponse>(response);
}


export const joinTrip = async (code: string): Promise<TripResponse> => {

    const response = await fetch(`${API_URL}/rooms/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        ...(await authHeaders()),
        },
        body: JSON.stringify({code})
    })

    return handleResponse(response);
}
