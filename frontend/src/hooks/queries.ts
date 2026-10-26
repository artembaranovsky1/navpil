import {useQuery} from "@tanstack/react-query";
import {getTrip, getTrips, getTripsSummary} from "../api/trips.ts";
import {getExpenses} from "../api/expense.ts";
import {getPayments} from "../api/payments.ts";
import {getMe} from "../api/user.ts";
import {queryKeys} from "./queryKeys.ts";

export const useMe = () =>
    useQuery({
        queryKey: queryKeys.me,
        queryFn: getMe,
        staleTime: Infinity,
    });

export const useTrips = () =>
    useQuery({
        queryKey: queryKeys.trips,
        queryFn: getTrips,
    });

export const useTripsSummary = () =>
    useQuery({
        queryKey: queryKeys.tripsSummary,
        queryFn: getTripsSummary,
    });

export const useTrip = (tripId: string | undefined) =>
    useQuery({
        queryKey: queryKeys.trip(tripId ?? ''),
        queryFn: () => getTrip(tripId!),
        enabled: !!tripId,
    });

export const useExpenses = (tripId: string | undefined) =>
    useQuery({
        queryKey: queryKeys.expenses(tripId ?? ''),
        queryFn: () => getExpenses(tripId!),
        enabled: !!tripId,
    });

export const usePayments = (tripId: string | undefined) =>
    useQuery({
        queryKey: queryKeys.payments(tripId ?? ''),
        queryFn: () => getPayments(tripId!),
        enabled: !!tripId,
    });

// усе, що потрібно сторінкам подорожі: сама подорож, витрати, перекази й поточний юзер
export const useTripPageData = (tripId: string | undefined) => {
    const trip = useTrip(tripId);
    const expenses = useExpenses(tripId);
    const payments = usePayments(tripId);
    const me = useMe();

    const queries = [trip, expenses, payments, me];

    return {
        trip: trip.data,
        expenses: expenses.data ?? [],
        payments: payments.data ?? [],
        currentUser: me.data,
        isPending: queries.some((query) => query.isPending),
        isError: queries.some((query) => query.isError),
    };
};
