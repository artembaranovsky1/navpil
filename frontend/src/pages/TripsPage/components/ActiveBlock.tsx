import './ActiveBlock.scss'
import {Link} from "react-router";
import type {TripResponse, TripSummary} from "../../../api/trips.ts";
import {getAvatarColor} from "../../../utils/colors.ts";
import {formatMoney, formatSignedMoney, formatTripDates} from "../../../utils/format.ts";

type ActiveBlockProps = {
    trip: TripResponse;
    // немає, якщо витрати подорожі не вдалося завантажити
    summary?: TripSummary;
};

const MAX_AVATARS = 4;

export const ActiveBlock = ({trip, summary}: ActiveBlockProps) => {
    const dates = formatTripDates(trip.startDate, trip.endDate);
    const visibleMembers = trip.members.slice(0, MAX_AVATARS);
    const hiddenCount = trip.members.length - visibleMembers.length;

    return (
        <Link to={`/trips/${trip.id}`} className='active-block'>
            <div className='active-block__left'>
                <div className='active-block__top'>
                    <div className='active-block__name'>{trip.name}</div>
                    <div className='active-block__status'>
                        <span className='active-block__status-dot'/>
                        триває
                    </div>
                </div>
                <div className='active-block__meta'>
                    {dates || 'Без дат'} · {trip.members.map((member) => member.name).join(', ')}
                </div>
                <div className='active-block__expenses'>
                    <div>
                        <div className='active-block__expenses-label'>витрачено</div>
                        <div className='active-block__expenses-value'>
                            {summary ? `${formatMoney(summary.total)} ₴` : '—'}
                        </div>
                    </div>
                    <div>
                        <div className='active-block__expenses-label'>твій баланс</div>
                        <div className={summary && summary.myBalance > 0
                            ? 'active-block__expenses-value active-block__expenses-value--positive'
                            : 'active-block__expenses-value'}>
                            {summary ? `${formatSignedMoney(summary.myBalance)} ₴` : '—'}
                        </div>
                    </div>
                </div>
            </div>

            <div className='active-block__right'>
                <div className='active-block__avatars' aria-hidden="true">
                    {visibleMembers.map((member) => (
                        <span key={member.id} className='active-block__avatar' style={{background: getAvatarColor(member.id)}}>
                            {member.name.trim().charAt(0).toUpperCase()}
                        </span>
                    ))}
                    {hiddenCount > 0 && <span className='active-block__avatar'>+{hiddenCount}</span>}
                </div>
                <span className='active-block__open'>
                    Відкрити
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                </span>
            </div>
        </Link>
    )
}
