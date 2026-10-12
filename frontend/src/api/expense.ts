import {ApiError} from "./ApiError.ts";

const API_URL = import.meta.env.VITE_API_URL;

export const EXPENSE_CATEGORIES = [
    'food',
    'transport',
    'housing',
    'entertainment',
    'shopping',
    'other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    food: 'Їжа',
    transport: 'Транспорт',
    housing: 'Житло',
    entertainment: 'Розваги',
    shopping: 'Покупки',
    other: 'Інше',
};

export type ExpenseResponse = {
    id: string;
    roomId: string;
    name: string;
    description?: string;
    amount: number;
    category: ExpenseCategory;
    addedById: string;
    paidById?: string;
    date: string;
    splitBetween: string[];
    createdAt: string;
};

export type CreateExpenseData = {
    name: string;
    description?: string;
    amount: number;
    category: ExpenseCategory;
    date?: string;
    paidById?: string;
    splitBetween?: string[];
};


export const getExpenses = async (tripId: string): Promise<ExpenseResponse[]> => {
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

export const createExpense = async (tripId: string, expenseData: CreateExpenseData): Promise<ExpenseResponse> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms/${tripId}/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
    })

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.error ?? 'create expense failed', data.details);
    }

    return data;
}

export const deleteExpense = async (tripId: string, expenseId: string): Promise<void> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/rooms/${tripId}/items/${expenseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new ApiError(response.status, data.error ?? 'delete expense failed', data.details);
    }
}
