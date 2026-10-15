import './SettlePage.scss'
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import {type ExpenseResponse, getExpenses} from "../../api/expense.ts";
import {getPayments, type PaymentResponse} from "../../api/payments.ts";
import {getTrip, type TripResponse} from "../../api/trips.ts";
import {getMe} from "../../api/user.ts";
import {NewExpense} from "../../components/NewExpense/NewExpense.tsx";
import {TripHeader} from "../../components/TripHeader/TripHeader.tsx";
import {Settlement} from "../../components/Settlement/Settlement.tsx";
import {ShareSummaryButton} from "../../components/ShareSummaryButton/ShareSummaryButton.tsx";
import {TripPageSkeleton} from "../../components/Skeleton/PageSkeletons.tsx";

export const SettlePage = () => {
    const [trip, setTrip] = useState<TripResponse | null>(null);
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [isNewExpenseOpen, setIsNewExpenseOpen] = useState<boolean>(false);

    const {tripId} = useParams();

    useEffect(() => {
        if (!tripId) return;

        const loadSettlement = async () => {
            try {
                const [tripData, expensesData, paymentsData, user] = await Promise.all([
                    getTrip(tripId),
                    getExpenses(tripId),
                    getPayments(tripId),
                    getMe(),
                ]);

                setTrip(tripData);
                setExpenses(expensesData);
                setPayments(paymentsData);
                setCurrentUserId(user.id);
            } catch {
                setError('Не вдалося завантажити розрахунок');
            } finally {
                setIsLoading(false);
            }
        };

        loadSettlement();
    }, [tripId]);

    if (isLoading) {
        return <TripPageSkeleton/>;
    }

    if (error || !trip || !tripId) {
        return <p role="alert">{error || 'Подорож не знайдено'}</p>;
    }

    return (
        <div className="settle-page page-appear">
            <TripHeader
                trip={trip}
                onAddExpense={() => setIsNewExpenseOpen(true)}
                actions={<ShareSummaryButton trip={trip} expenses={expenses} payments={payments}/>}
            />

            <Settlement
                trip={trip}
                expenses={expenses}
                payments={payments}
                currentUserId={currentUserId}
                onPaymentCreated={(payment) => setPayments((current) => [...current, payment])}
            />

            {isNewExpenseOpen && (
                <NewExpense
                    tripId={tripId}
                    members={trip.members}
                    currentUserId={currentUserId}
                    onCreated={(expense) => setExpenses((current) => [...current, expense])}
                    onClose={() => setIsNewExpenseOpen(false)}
                />
            )}
        </div>
    );
};
