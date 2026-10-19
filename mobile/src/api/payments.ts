import {ApiError} from "@/api/ApiError";
import {authHeaders} from "@/api/helper";

const API_URL = process.env.EXPO_PUBLIC_API_URL;


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

const handleResponse = async <T>(response: Response): Promise<T> => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(response.status, data?.error ?? 'Request failed', data?.details ?? null);
    }

    return data as T;
};


export const getPayments = async (tripId: string): Promise<PaymentResponse[]> => {
    const response = await fetch(`${API_URL}/rooms/${tripId}/payments`, {
        headers: await authHeaders(),
    });

    return handleResponse<PaymentResponse[]>(response);
};

export const createPayment = async (tripId: string, paymentData: CreatePaymentData): Promise<PaymentResponse> => {
    const response = await fetch(`${API_URL}/rooms/${tripId}/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(await authHeaders()),
        },
        body: JSON.stringify(paymentData),
    });

    return handleResponse<PaymentResponse>(response);
};
