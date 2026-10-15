import './MembersPage.scss'
import {ShareSummaryButton} from "../../components/ShareSummaryButton/ShareSummaryButton.tsx";
import {TripHeader} from "../../components/TripHeader/TripHeader.tsx";
import {NewExpense} from "../../components/NewExpense/NewExpense.tsx";
import {useEffect, useState} from "react";
import {getTrip, type TripResponse} from "../../api/trips.ts";
import {type ExpenseResponse, getExpenses} from "../../api/expense.ts";
import {getPayments, type PaymentResponse} from "../../api/payments.ts";
import {getMe, type User} from "../../api/user.ts";
import {useNavigate, useParams} from "react-router";
import {MembersTable} from "./components/MembersTable/MembersTable.tsx";
import {InviteCard} from "./components/InviteCard/InviteCard.tsx";
import {TripPageSkeleton} from "../../components/Skeleton/PageSkeletons.tsx";

export const MembersPage = () => {
    const [trip, setTrip] = useState<TripResponse | null>(null);
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [currentUser, setCurrentUser] = useState<User>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [isNewExpenseOpen, setIsNewExpenseOpen] = useState<boolean>(false);

    const {tripId} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!tripId) return;

        const loadMembers = async () => {
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
                setCurrentUser(user)
            } catch {
                setError('Не вдалося завантажити учасників')
                navigate('/login', {replace: true});
            } finally {
                setIsLoading(false)
            }
        }

        loadMembers()
    }, [tripId, navigate])

    if (isLoading) {
        return <TripPageSkeleton/>;
    }

    if (error || !trip || !tripId) {
        return <p role="alert">{error || 'Подорож не знайдено'}</p>;
    }

    const handleMemberRemoved = (userId: string) => {
        setTrip((current) => current && {
            ...current,
            members: current.members.filter((member) => member.id !== userId),
        });
    };

    return (
        <div className="members-page page-appear">
            <TripHeader
                trip={trip}
                onAddExpense={() => setIsNewExpenseOpen(true)}
                actions={<ShareSummaryButton trip={trip} expenses={expenses} payments={payments}/>}
            />

            <div className="members-page__columns">
                <div className="members-page__main">
                    <MembersTable
                        tripId={tripId}
                        members={trip.members}
                        expenses={expenses}
                        payments={payments}
                        currentUserId={currentUser?.id}
                        currentUserEmail={currentUser?.email}
                        onRemoved={handleMemberRemoved}
                    />

                </div>

                <div className="members-page__aside">
                    <InviteCard tripName={trip.name} inviteCode={trip.inviteCode}/>
                </div>
            </div>

            {isNewExpenseOpen && (
                <NewExpense
                    tripId={tripId}
                    members={trip.members}
                    currentUserId={currentUser?.id}
                    onCreated={(expense) => setExpenses((current) => [...current, expense])}
                    onClose={() => setIsNewExpenseOpen(false)}
                />
            )}
        </div>
    );
};
