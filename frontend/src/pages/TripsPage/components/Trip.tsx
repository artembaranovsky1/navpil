import type {TripResponse} from "../../../api/trips.ts";

type ActiveBlockProps = {
    trip: TripResponse,
};

export const Trip = ({trip}: ActiveBlockProps) => {

    const formatMonth = (date: string): string =>
        new Date(date).toLocaleDateString('uk-UA', {month: 'long', timeZone: 'UTC'});

    return (
        <a className='my-trip__trip'>
            <div className='my-trip__trip-icon'>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 21V9l8-6 8 6v12M9 21v-7h6v7"></path>
                </svg>
            </div>
            <div>
                <div className='my-trip__trip-title'>{trip.name}</div>
                <div className='my-trip__trip-meta'>
                    {trip.endDate ? formatMonth(trip.endDate) : 'Без дат'} · {trip.members.length} учасники
                </div>
            </div>
            <div className='my-trip__trip-footer'>
                <div className='trip-name'>4 350 ₴</div>
                <div className='my-trip__trip-badge'>розраховано</div>
            </div>
        </a>
    )
}