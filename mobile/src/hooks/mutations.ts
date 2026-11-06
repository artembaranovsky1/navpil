import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createTrip, joinTrip} from "@/api/trips";
import {router} from "expo-router";
import {createExpense, CreateExpenseData, deleteExpense, ExpenseResponse, updateExpense, UpdateExpenseData} from "@/api/expense";
import {ApiError} from "@/api/ApiError";

export const useJoinTrip = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: joinTrip,
        onSuccess: (trip) => {
            queryClient.invalidateQueries({queryKey: ['trips']})
            router.replace(`/trip/${trip.id}`)
        }
    })
}

export const useCreateTrip = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTrip,
        onSuccess: (trip) => {
            queryClient.invalidateQueries({queryKey: ['trips']})
            router.replace(`/trip/${trip.id}`)
        }
    })
}

export const useCreateExpense = (tripId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateExpenseData ) => createExpense(tripId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['expenses', tripId]})
            queryClient.invalidateQueries({queryKey: ['trips', 'summary']})
        }
    })
}

export const useUpdateExpense = (tripId: string, expenseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateExpenseData) => updateExpense(tripId, expenseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['expenses', tripId]});
            queryClient.invalidateQueries({queryKey: ['expense', tripId, expenseId]});
            queryClient.invalidateQueries({queryKey: ['trips', 'summary']});
            router.back()
        }
    })
}
export const useDeleteExpense = (tripId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (expenseId: string) => deleteExpense(tripId, expenseId),
        onSuccess: (_, expenseId) => {
            queryClient.setQueryData<ExpenseResponse[]>(['expenses', tripId], (expenses) =>
                expenses?.filter((expense) => expense.id !== expenseId));
            queryClient.invalidateQueries({queryKey: ['trips', 'summary']});
        }
    })
}
