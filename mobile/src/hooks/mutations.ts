import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createTrip, joinTrip} from "@/api/trips";
import {router} from "expo-router";
import {createExpense, CreateExpenseData, updateExpense, UpdateExpenseData} from "@/api/expense";
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
            router.back()
        }
    })
}