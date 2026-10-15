import './Trip.scss'
import {Link} from "react-router";
import type {TripResponse} from "../../../api/trips.ts";
import {formatTripDates, pluralize} from "../../../utils/format.ts";
import {getAvatarColor} from "../../../utils/colors.ts";

type TripProps = {
    trip: TripResponse,
};

const DAY_MS = 24 * 60 * 60 * 1000;

// скільки днів до початку подорожі (за календарем, без часових поясів)
const daysUntil = (date: string): number => {
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((Date.parse(date.slice(0, 10)) - today) / DAY_MS);
};

const getBadge = (trip: TripResponse): string => {
    if (trip.status === 'past') return 'завершена';
    if (!trip.startDate) return 'скоро';

    const days = daysUntil(trip.startDate);
    if (days <= 0) return 'скоро';
    if (days === 1) return 'завтра';
    return `через ${days} ${pluralize(days, ['день', 'дні', 'днів'])}`;
};

const MAX_AVATARS = 3;

export const Trip = ({trip}: TripProps) => {
    const dates = formatTripDates(trip.startDate, trip.endDate);
    const membersCount = trip.members.length;
    const visibleMembers = trip.members.slice(0, MAX_AVATARS);
    const hiddenCount = membersCount - visibleMembers.length;
    const isPast = trip.status === 'past';

    return (
        <Link to={`/trips/${trip.id}`} className={isPast ? 'trip-card trip-card--past' : 'trip-card'}>
            <div className='trip-card__icon'>
                {isPast ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 21V9l8-6 8 6v12M9 21v-7h6v7"/>
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="16" rx="3"/>
                        <path d="M3 10h18M8 3v4M16 3v4"/>
                    </svg>
                )}
            </div>

            <div>
                <div className='trip-card__title'>{trip.name}</div>
                <div className='trip-card__meta'>
                    {dates || 'Без дат'} · {membersCount} {pluralize(membersCount, ['учасник', 'учасники', 'учасників'])}
                </div>
            </div>

            <div className='trip-card__footer'>
                <div className='trip-card__avatars' aria-hidden="true">
                    {visibleMembers.map((member) => (
                        <span key={member.id} className='trip-card__avatar trip-card__avatar--colored' style={{background: getAvatarColor(member.id)}}>
                            {member.name.trim().charAt(0).toUpperCase()}
                        </span>
                    ))}
                    {hiddenCount > 0 && <span className='trip-card__avatar'>+{hiddenCount}</span>}
                </div>
                <div className={isPast ? 'trip-card__badge' : 'trip-card__badge trip-card__badge--upcoming'}>
                    {getBadge(trip)}
                </div>
            </div>
        </Link>
    )
}
