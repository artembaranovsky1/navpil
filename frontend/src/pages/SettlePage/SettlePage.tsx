import './SettlePage.scss'
import {useState} from "react";
import {useParams} from "react-router";
import {useTripPageData} from "../../hooks/queries.ts";
import {NewExpense} from "../../components/NewExpense/NewExpense.tsx";
import {TripHeader} from "../../components/TripHeader/TripHeader.tsx";
import {Settlement} from "../../components/Settlement/Settlement.tsx";
import {TripPageSkeleton} from "../../components/Skeleton/PageSkeletons.tsx";
import {MemberAvatars} from "../TripExpensesPage/components/MemberAvatars/MemberAvatars.tsx";

export const SettlePage = () => {
    const [isNewExpenseOpen, setIsNewExpenseOpen] = useState<boolean>(false);

    const {tripId} = useParams();
    const {trip, expenses, payments, currentUser, isPending, isError} = useTripPageData(tripId);
    const currentUserId = currentUser?.id;

    if (isPending) {
        return <TripPageSkeleton/>;
    }

    if (isError || !trip || !tripId) {
        return <p role="alert">{isError ? 'Не вдалося завантажити розрахунок' : 'Подорож не знайдено'}</p>;
    }

    return (
        <div className="settle-page page-appear">
            <TripHeader
                trip={trip}
                onAddExpense={() => setIsNewExpenseOpen(true)}
                actions={<MemberAvatars tripId={tripId} members={trip.members} currentUserId={currentUserId}/>}
            />

            <Settlement
                trip={trip}
                expenses={expenses}
                payments={payments}
                currentUserId={currentUserId}
            />

            {isNewExpenseOpen && (
                <NewExpense
                    tripId={tripId}
                    members={trip.members}
                    currentUserId={currentUserId}
                    onClose={() => setIsNewExpenseOpen(false)}
                />
            )}
        </div>
    );
};
