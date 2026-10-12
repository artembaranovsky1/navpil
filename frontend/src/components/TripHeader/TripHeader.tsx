import "./TripHeader.scss";
import type {ReactNode} from "react";
import {Link, NavLink} from "react-router";
import type {TripResponse, TripStatus} from "../../api/trips.ts";
import {formatTripDates} from "../../utils/format.ts";

type TripHeaderProps = {
    trip: TripResponse;
    onAddExpense: () => void;
    // додаткові кнопки зліва від «Додати витрату»
    actions?: ReactNode;
}

const STATUS_LABELS: Record<TripStatus, string> = {
    active: 'триває',
    upcoming: 'скоро',
    past: 'завершена',
};

const tabClass = ({isActive}: { isActive: boolean }) =>
    isActive ? 'trip-header__tab trip-header__tab--active' : 'trip-header__tab';

export const TripHeader = ({trip, onAddExpense, actions}: TripHeaderProps) => {
    const dates = formatTripDates(trip.startDate, trip.endDate);

    return (
        <header className="trip-header">
            <div className="trip-header__top">
                <div>
                    <div className="trip-header__breadcrumbs">
                        <Link to="/trips" className="trip-header__breadcrumb-link">Мої подорожі</Link>
                        {' / '}
                        {dates && `${dates} · `}{STATUS_LABELS[trip.status]}
                    </div>
                    <h1 className="trip-header__title">{trip.name}</h1>
                </div>

                <div className="trip-header__actions">
                    {actions}
                    <button type="button" className="trip-header__add" onClick={onAddExpense}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                             strokeLinecap="round" aria-hidden="true">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Додати витрату
                    </button>
                </div>
            </div>

            <nav aria-label="Розділи подорожі" className="trip-header__tabs">
                <NavLink to={`/trips/${trip.id}`} end className={tabClass}>Витрати</NavLink>
                <NavLink to={`/trips/${trip.id}/settle`} className={tabClass}>Розрахунок</NavLink>
                <NavLink to={`/trips/${trip.id}/members`} className={tabClass}>Учасники · {trip.members.length}</NavLink>
            </nav>
        </header>
    );
};
