import './TripExpensesPage.scss'
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {type ExpenseResponse, getExpenses} from "../../api/expense.ts";
import {getPayments, type PaymentResponse} from "../../api/payments.ts";
import {getTrip, type TripResponse} from "../../api/trips.ts";
import {getMe} from "../../api/user.ts";
import {NewExpense} from "../../components/NewExpense/NewExpense.tsx";
import {ExpensesTable} from "../../components/ExpensesTable/ExpensesTable.tsx";
import {TripHeader} from "../../components/TripHeader/TripHeader.tsx";
import {calculateSettlement} from "../../utils/settle.ts";
import {ExpenseSummary} from "./components/ExpenseSummary/ExpenseSummary.tsx";
import {MemberAvatars} from "./components/MemberAvatars/MemberAvatars.tsx";
import {DailyChart} from "./components/DailyChart/DailyChart.tsx";
import {CategoryChart} from "./components/CategoryChart/CategoryChart.tsx";
import {PaidByMembers} from "./components/PaidByMembers/PaidByMembers.tsx";
import {SettleLink} from "./components/SettleLink/SettleLink.tsx";
import {ExpenseDetail} from "./components/ExpenseDetail/ExpenseDetail.tsx";
import {EditExpense} from "./components/EditExpense/EditExpense.tsx";
import {TripPageSkeleton} from "../../components/Skeleton/PageSkeletons.tsx";

export const TripExpensesPage = () => {
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
    const [payments, setPayments] = useState<PaymentResponse[]>([])
    const [trip, setTrip] = useState<TripResponse | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')

    const [isNewExpenseOpen, setIsNewExpenseOpen] = useState<boolean>(false)
    const [selectedExpenseId, setSelectedExpenseId] = useState<string>()
    const [isEditingExpense, setIsEditingExpense] = useState<boolean>(false)

    console.log(trip)

    const navigate = useNavigate();

    const {tripId} = useParams()

    useEffect(() => {
        if (!tripId) return;

        const loadExpenses = async () => {
            try {
                const [tripData, expensesData, paymentsData, user] = await Promise.all([
                    getTrip(tripId),
                    getExpenses(tripId),
                    getPayments(tripId),
                    getMe(),
                ]);

                setExpenses(expensesData)
                setPayments(paymentsData)
                setTrip(tripData)
                setCurrentUserId(user.id)
            } catch {
                setError('Не вдалося завантажити витрати')
                navigate('/login', {replace: true});
            } finally {
                setIsLoading(false)
            }
        }

        loadExpenses()
    }, [tripId])

    if (isLoading) {
        return <TripPageSkeleton/>;
    }

    if (error || !trip || !tripId) {
        return <p role="alert">{error || 'Подорож не знайдено'}</p>;
    }

    const selectedExpense = expenses.find((expense) => expense.id === selectedExpenseId);
    const {balances, transfers} = calculateSettlement(trip.members, expenses, payments);

    return (
        <div className="trip-expenses-page page-appear">
            <TripHeader
                trip={trip}
                onAddExpense={() => setIsNewExpenseOpen(true)}
                actions={<MemberAvatars tripId={tripId} members={trip.members} currentUserId={currentUserId}/>}
            />

            <ExpenseSummary
                trip={trip}
                expenses={expenses}
                payments={payments}
                currentUserId={currentUserId}
            />

            <div className="trip-expenses-page__columns">
                <div className="trip-expenses-page__main">
                    <ExpensesTable
                        tripId={tripId}
                        expenses={expenses}
                        members={trip.members}
                        currentUserId={currentUserId}
                        onSelect={(expense) => setSelectedExpenseId(expense.id)}
                    />
                    <DailyChart trip={trip} expenses={expenses}/>
                </div>

                <div className="trip-expenses-page__aside">
                    <CategoryChart expenses={expenses}/>
                    <PaidByMembers members={trip.members} balances={balances}/>
                    <SettleLink tripId={tripId} transfersCount={transfers.length}/>
                </div>
            </div>

            {isNewExpenseOpen && (
                <NewExpense
                    tripId={tripId}
                    members={trip.members}
                    currentUserId={currentUserId}
                    onCreated={(expense) => setExpenses((current) => [...current, expense])}
                    onClose={() => setIsNewExpenseOpen(false)}
                />
            )}

            {selectedExpense && !isEditingExpense && (
                <ExpenseDetail
                    tripId={tripId}
                    expense={selectedExpense}
                    members={trip.members}
                    currentUserId={currentUserId}
                    onClose={() => setSelectedExpenseId(undefined)}
                    onEdit={() => setIsEditingExpense(true)}
                    onDeleted={(expenseId) => {
                        setExpenses((current) => current.filter((expense) => expense.id !== expenseId))
                        setSelectedExpenseId(undefined)
                    }}
                />
            )}

            {selectedExpense && isEditingExpense && (
                <EditExpense
                    tripId={tripId}
                    expense={selectedExpense}
                    members={trip.members}
                    onUpdated={(updated) => {
                        setExpenses((current) => current.map((expense) => expense.id === updated.id ? updated : expense))
                        setIsEditingExpense(false)
                    }}
                    onClose={() => setIsEditingExpense(false)}
                />
            )}
        </div>
    );
};
