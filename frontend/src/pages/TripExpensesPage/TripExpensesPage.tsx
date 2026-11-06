import './TripExpensesPage.scss'
import {useState} from "react";
import {useParams} from "react-router";
import {useTripPageData} from "../../hooks/queries.ts";
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
    const [isNewExpenseOpen, setIsNewExpenseOpen] = useState<boolean>(false)
    const [selectedExpenseId, setSelectedExpenseId] = useState<string>()
    const [isEditingExpense, setIsEditingExpense] = useState<boolean>(false)

    const {tripId} = useParams()
    const {trip, expenses, payments, currentUser, isPending, isError} = useTripPageData(tripId)
    const currentUserId = currentUser?.id

    if (isPending) {
        return <TripPageSkeleton/>;
    }

    if (isError || !trip || !tripId) {
        return <p role="alert">{isError ? 'Не вдалося завантажити витрати' : 'Подорож не знайдено'}</p>;
    }

    const selectedExpense = expenses.find((expense) => expense.id === selectedExpenseId);
    const {balances, transfers} = calculateSettlement(trip.members, expenses, payments);

    return (
        <div className="trip-expenses-page page-appear">
            <TripHeader
                trip={trip}
                onAddExpense={() => setIsNewExpenseOpen(true)}
                actions={<MemberAvatars tripId={tripId} members={trip.members} currentUserId={currentUserId}/>}
                mobileSummary={<CategoryChart expenses={expenses} compact/>}
            />

            <div className="trip-expenses-page__desktop-only">
                <ExpenseSummary
                    trip={trip}
                    expenses={expenses}
                    payments={payments}
                    currentUserId={currentUserId}
                />
            </div>

            <div className="trip-expenses-page__columns">
                <div className="trip-expenses-page__main">
                    <ExpensesTable
                        tripId={tripId}
                        expenses={expenses}
                        members={trip.members}
                        currentUserId={currentUserId}
                        onSelect={(expense) => setSelectedExpenseId(expense.id)}
                    />
                    <div className="trip-expenses-page__desktop-only">
                        <DailyChart trip={trip} expenses={expenses}/>
                    </div>
                </div>

                <div className="trip-expenses-page__aside trip-expenses-page__desktop-only">
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
                    onDeleted={() => setSelectedExpenseId(undefined)}
                />
            )}

            {selectedExpense && isEditingExpense && (
                <EditExpense
                    tripId={tripId}
                    expense={selectedExpense}
                    members={trip.members}
                    onUpdated={() => setIsEditingExpense(false)}
                    onClose={() => setIsEditingExpense(false)}
                />
            )}
        </div>
    );
};
