import {ApiError} from "./ApiError.ts";

const API_URL = import.meta.env.VITE_API_URL;

export type PaymentResponse = {
    id: string;
    roomId: string;
    fromId: string;
    toId: string;
    amount: number;
    createdById: string;
    createdAt: string;
};

export type CreatePaymentData = {
    fromId: string;
    toId: string;
    amount: number;
};

export const getPayments = async (tripId: string): Promise<PaymentResponse[]> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms/${tripId}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.error ?? 'get payments failed', data.details);
    }

    return data;
};

export const createPayment = async (tripId: string, paymentData: CreatePaymentData): Promise<PaymentResponse> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms/${tripId}/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.error ?? 'create payment failed', data.details);
    }

    return data;
};
