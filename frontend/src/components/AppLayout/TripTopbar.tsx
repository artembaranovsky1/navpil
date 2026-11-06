import {Link} from "react-router";
import {useMe, useTrip} from "../../hooks/queries.ts";
import {MemberAvatars} from "../../pages/TripExpensesPage/components/MemberAvatars/MemberAvatars.tsx";

type TripTopbarProps = {
    tripId: string;
}

// мобільна шапка сторінок подорожі: назад до списку і учасники
export const TripTopbar = ({tripId}: TripTopbarProps) => {
    // дані вже в кеші — їх тягне сама сторінка подорожі
    const {data: trip} = useTrip(tripId);
    const {data: me} = useMe();

    return (
        <header className='app-layout__header'>
            <Link to='/trips' className='app-layout__back' aria-label='До списку подорожей'>
                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8'
                     strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                    <path d='M15 5l-7 7 7 7'/>
                </svg>
                <span className='app-layout__wordmark'>nav<span className='app-layout__wordmark-slash'>/</span>pil</span>
            </Link>

            {trip && <MemberAvatars tripId={tripId} members={trip.members} currentUserId={me?.id} compact/>}
        </header>
    );
};
