import {ApiError} from "@/api/ApiError";
import {authHeaders, handleResponse} from "@/api/helper";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

export type UpdateExpenseData = {
    name?: string;
    description?: string;
    amount?: number;
    category?: ExpenseCategory;
    date?: string;
    paidById?: string;
    splitBetween?: string[];
};


export const createExpense = async (tripId: string, expenseData: CreateExpenseData): Promise<ExpenseResponse> => {
    const response = await fetch(`${API_URL}/rooms/${tripId}/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(await authHeaders()),
        },
        body: JSON.stringify(expenseData),
    })

    return handleResponse(response);
}


export const getExpenses = async (tripId: string): Promise<ExpenseResponse[]> => {
    const response = await fetch(`${API_URL}/rooms/${tripId}/items`, {
        headers: await authHeaders(),
    })

    return handleResponse<ExpenseResponse[]>(response);
}


export const getExpense = async (tripId: string, expenseId: string): Promise<ExpenseResponse> => {
    const response = await fetch(`${API_URL}/rooms/${tripId}/items/${expenseId}`, {
        headers: await authHeaders(),
    });

    return handleResponse<ExpenseResponse>(response);
};


export const updateExpense = async (
    tripId: string,
    expenseId: string,
    changes: UpdateExpenseData,
): Promise<ExpenseResponse> => {
    const response = await fetch(`${API_URL}/rooms/${tripId}/items/${expenseId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(await authHeaders()),
        },
        body: JSON.stringify(changes),
    })

    return handleResponse<ExpenseResponse>(response);
}
