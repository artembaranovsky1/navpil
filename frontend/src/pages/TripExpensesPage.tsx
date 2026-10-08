import {useEffect, useState} from "react";

import {useParams} from "react-router";
import {type ExpenseResponse, getExpenses} from "../api/expense.ts";
import { getTrip, type TripMember, type TripResponse} from "../api/trips.ts";

const getMemberName = (members: TripMember[], userId: string): string => {
    const member = members.find((m) => m.id === userId);
    return member ? member.name : 'Невідомий';
};

export const TripExpensesPage = () => {
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
    const [trip, setTrip] = useState<TripResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')

    console.log(expenses)

    const {tripId} = useParams()

    useEffect(() => {
        if (!tripId) return;

        const loadExpenses = async () => {
            try {
                const [tripData, expensesData] = await Promise.all([getTrip(tripId), getExpenses(tripId)]);

                setExpenses(expensesData)
                setTrip(tripData)
            } catch (err) {
                setError(err)
            } finally {
                setIsLoading(false)
            }
        }

        loadExpenses()
    }, [tripId])


    return <div>
        <h1>TripExpensesPage</h1>
        <div>
            {expenses.map((expense) => (
                <div key={expense.id}>
                    <div>{expense.name} — {getMemberName(trip.members, expense.addedById)}</div>
                </div>
            ))}
        </div>
    </div>;
};
