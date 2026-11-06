import {ApiError} from "@/api/ApiError";
import {authHeaders, handleResponse} from "@/api/helper";

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

export const getTrip = async (tripId: string): Promise<TripResponse> => {

    const response = await fetch(`${API_URL}/rooms/${tripId}`, {
        headers: await authHeaders(),
    });


    return handleResponse<TripResponse>(response);
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
    const response = await fetch(`${API_URL}/rooms/summary`, {
        headers: await authHeaders(),
    });

    return handleResponse<TripsSummaryResponse>(response);
}
