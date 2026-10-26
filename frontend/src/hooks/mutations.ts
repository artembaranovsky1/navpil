import {useMutation, useQueryClient} from "@tanstack/react-query";
import {login, register} from "../api/auth.ts";
import {
    createTrip,
    deleteTrip,
    joinTrip,
    removeMember,
    type TripResponse,
    updateTrip,
    type UpdateTripData
} from "../api/trips.ts";
import {
    createExpense,
    type CreateExpenseData,
    deleteExpense,
    type ExpenseResponse,
    updateExpense,
    type UpdateExpenseData
} from "../api/expense.ts";
import {createPayment, type CreatePaymentData, type PaymentResponse} from "../api/payments.ts";
import {queryKeys} from "./queryKeys.ts";

type Credentials = {
    email: string;
    password: string;
}

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({email, password}: Credentials) => login(email, password),
        onSuccess: ({token}) => {
            localStorage.setItem('token', token);
            // дані попереднього юзера не мають показатися новому
            queryClient.clear();
        },
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({name, email, password}: Credentials & { name: string }) => {
            await register(name, email, password);
            return login(email, password);
        },
        onSuccess: ({token}) => {
            localStorage.setItem('token', token);
            queryClient.clear();
        },
    });
};

export const useCreateTrip = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTrip,
        onSuccess: (trip) => {
            queryClient.setQueryData(queryKeys.trip(trip.id), trip);
            queryClient.invalidateQueries({queryKey: queryKeys.trips});
        },
    });
};

export const useJoinTrip = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: joinTrip,
        onSuccess: (trip) => {
            queryClient.setQueryData(queryKeys.trip(trip.id), trip);
            queryClient.invalidateQueries({queryKey: queryKeys.trips});
        },
    });
};

export const useUpdateTrip = (tripId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (changes: UpdateTripData) => updateTrip(tripId, changes),
        onSuccess: (trip) => {
            queryClient.setQueryData(queryKeys.trip(tripId), trip);
            queryClient.invalidateQueries({queryKey: queryKeys.trips});
        },
    });
};

export const useDeleteTrip = (tripId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deleteTrip(tripId),
        onSuccess: () => {
            queryClient.removeQueries({queryKey: queryKeys.trip(tripId)});
            queryClient.removeQueries({queryKey: queryKeys.expenses(tripId)});
            queryClient.removeQueries({queryKey: queryKeys.payments(tripId)});
            queryClient.invalidateQueries({queryKey: queryKeys.trips});
        },
    });
};

export const useRemoveMember = (tripId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => removeMember(tripId, userId),
        onSuccess: (_, userId) => {
            queryClient.setQueryData<TripResponse>(queryKeys.trip(tripId), (trip) => trip && {
                ...trip,
                members: trip.members.filter((member) => member.id !== userId),
            });
            queryClient.invalidateQueries({queryKey: queryKeys.trips});
        },
    });
};

export const useCreateExpense = (tripId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateExpenseData) => createExpense(tripId, data),
        onSuccess: (expense) => {
            queryClient.setQueryData<ExpenseResponse[]>(queryKeys.expenses(tripId), (expenses) =>
                expenses && [...expenses, expense]);
            queryClient.invalidateQueries({queryKey: queryKeys.tripsSummary});
        },
    });
};

export const useUpdateExpense = (tripId: string, expenseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (changes: UpdateExpenseData) => updateExpense(tripId, expenseId, changes),
        onSuccess: (updated) => {
            queryClient.setQueryData<ExpenseResponse[]>(queryKeys.expenses(tripId), (expenses) =>
                expenses?.map((expense) => expense.id === updated.id ? updated : expense));
            queryClient.invalidateQueries({queryKey: queryKeys.tripsSummary});
        },
    });
};

export const useDeleteExpense = (tripId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (expenseId: string) => deleteExpense(tripId, expenseId),
        onSuccess: (_, expenseId) => {
            queryClient.setQueryData<ExpenseResponse[]>(queryKeys.expenses(tripId), (expenses) =>
                expenses?.filter((expense) => expense.id !== expenseId));
            queryClient.invalidateQueries({queryKey: queryKeys.tripsSummary});
        },
    });
};

export const useCreatePayment = (tripId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePaymentData) => createPayment(tripId, data),
        onSuccess: (payment) => {
            queryClient.setQueryData<PaymentResponse[]>(queryKeys.payments(tripId), (payments) =>
                payments && [...payments, payment]);
            queryClient.invalidateQueries({queryKey: queryKeys.tripsSummary});
        },
    });
};
