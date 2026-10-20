import {useQuery} from "@tanstack/react-query";
import {getTrip, getTrips} from "@/api/trips";
import {getExpense, getExpenses} from "@/api/expense";
import {getPayments} from "@/api/payments";
import {getMe} from "@/api/user";

export const useMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        staleTime: Infinity,
    })
}

export const useTrips = () =>
    useQuery({
        queryKey: ['trips'],
        queryFn: getTrips,
    });

export const useTrip = (tripId: string) =>
    useQuery({
        queryKey: ['trip', tripId],
        queryFn: () => getTrip(tripId),
        enabled: !!tripId,
    });

export const useExpenses = (tripId: string) =>
    useQuery({
        queryKey: ['expenses', tripId],
        queryFn: () => getExpenses(tripId),
        enabled: !!tripId,
    });

export const useExpense = (tripId: string, expenseId: string) =>
    useQuery({
        queryKey: ['expense', tripId, expenseId],
        queryFn: () => getExpense(tripId, expenseId),
        enabled: !!tripId && !!expenseId,
    });

export const usePayments = (tripId: string) =>
    useQuery({
        queryKey: ['payments', tripId],
        queryFn: () => getPayments(tripId),
        enabled: !!tripId,
    });