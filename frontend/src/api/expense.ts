import {ApiError} from "./ApiError.ts";

const API_URL = import.meta.env.VITE_API_URL;

export type ExpenseResponse = {
    id: string;
    roomId: string;
    name: string;
    quantity: number;
    price: number;
    addedById: string;
    date: string;
    splitBetween: string[];
    createdAt: string;
};


export const getExpenses = async (tripId: string): Promise<ExpenseResponse> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms/${tripId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.error ?? 'get expenses failed', data.details);
    }

    return data;
}