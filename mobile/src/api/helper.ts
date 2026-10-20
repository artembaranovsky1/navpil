import * as SecureStore from 'expo-secure-store';
import {ApiError} from "@/api/ApiError";

export const authHeaders = async () => {
    const token = await SecureStore.getItemAsync('token');
    return { Authorization: `Bearer ${token}` };
};

// Date → '2026-05-12'
export const toApiDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// '2026-05-12' → Date (у локальному часі)
export const fromApiDate = (value: string) => {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const handleResponse = async <T>(response: Response): Promise<T> => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(response.status, data?.error ?? 'Request failed', data?.details ?? null);
    }

    return data as T;
};
