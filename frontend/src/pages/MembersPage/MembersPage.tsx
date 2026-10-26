import './MembersPage.scss'
import {TripHeader} from "../../components/TripHeader/TripHeader.tsx";
import {NewExpense} from "../../components/NewExpense/NewExpense.tsx";
import {useState} from "react";
import {useTripPageData} from "../../hooks/queries.ts";
import {useDeleteTrip} from "../../hooks/mutations.ts";
import {useNavigate, useParams} from "react-router";
import {MembersTable} from "./components/MembersTable/MembersTable.tsx";
import {InviteCard} from "./components/InviteCard/InviteCard.tsx";
import {TripPageSkeleton} from "../../components/Skeleton/PageSkeletons.tsx";
import {MemberAvatars} from "../TripExpensesPage/components/MemberAvatars/MemberAvatars.tsx";
import {EditTrip} from "../NewTripPage/EditTrip.tsx";
import {TripSettingsCard} from "./components/TripSettingsCard/TripSettingsCard.tsx";

export const MembersPage = () => {
    const [isNewExpenseOpen, setIsNewExpenseOpen] = useState<boolean>(false);
    const [isEditTripOpen, setIsEditTripOpen] = useState<boolean>(false);

    const {tripId} = useParams();
    const navigate = useNavigate();
    const {trip, expenses, payments, currentUser, isPending, isError} = useTripPageData(tripId);
    const deleteTripMutation = useDeleteTrip(tripId ?? '');
    const currentUserId = currentUser?.id;

    if (isPending) {
        return <TripPageSkeleton/>;
    }

    if (isError || !trip || !tripId) {
        return <p role="alert">{isError ? 'Не вдалося завантажити учасників' : 'Подорож не знайдено'}</p>;
    }

    const handleDeleteTrip = async () => {
        await deleteTripMutation.mutateAsync();
        navigate('/trips', {replace: true});
    };

    const isOwner = trip.members.some((member) => member.id === currentUserId && member.role === 'owner');

    return (
        <div className="members-page page-appear">
            <TripHeader
                trip={trip}
                onAddExpense={() => setIsNewExpenseOpen(true)}
                actions={<MemberAvatars tripId={tripId} members={trip.members} currentUserId={currentUserId}/>}
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
                    />

                </div>

                <div className="members-page__aside">
                    <InviteCard tripName={trip.name} inviteCode={trip.inviteCode}/>
                    <TripSettingsCard
                        tripName={trip.name}
                        canDelete={isOwner}
                        onEdit={() => setIsEditTripOpen(true)}
                        onDelete={handleDeleteTrip}
                    />
                </div>
            </div>

            {isNewExpenseOpen && (
                <NewExpense
                    tripId={tripId}
                    members={trip.members}
                    currentUserId={currentUser?.id}
                    onClose={() => setIsNewExpenseOpen(false)}
                />
            )}

            {isEditTripOpen && (
                <EditTrip
                    trip={trip}
                    onUpdated={() => setIsEditTripOpen(false)}
                    onClose={() => setIsEditTripOpen(false)}
                />
            )}
        </div>
    );
};
