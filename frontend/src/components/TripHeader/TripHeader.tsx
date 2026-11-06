import "./TripHeader.scss";
import type {ReactNode} from "react";
import {createPortal} from "react-dom";
import {Link, NavLink} from "react-router";
import type {TripResponse, TripStatus} from "../../api/trips.ts";
import {formatMoney, formatSignedMoney, formatTripDates} from "../../utils/format.ts";
import {calculateSettlement, totalAmount} from "../../utils/settle.ts";
import {useTripPageData} from "../../hooks/queries.ts";

type TripHeaderProps = {
    trip: TripResponse;
    onAddExpense: () => void;
    // додаткові кнопки зліва від «Додати витрату»
    actions?: ReactNode;
    // на мобільному — між підсумком і вкладками (наприклад, категорії)
    mobileSummary?: ReactNode;
}

const STATUS_LABELS: Record<TripStatus, string> = {
    active: 'триває',
    upcoming: 'скоро',
    past: 'завершена',
};

const tabClass = ({isActive}: { isActive: boolean }) =>
    isActive ? 'trip-header__tab trip-header__tab--active' : 'trip-header__tab';

export const TripHeader = ({trip, onAddExpense, actions, mobileSummary}: TripHeaderProps) => {
    const dates = formatTripDates(trip.startDate, trip.endDate);

    // для мобільного підсумку; дані вже в кеші — їх завантажила сторінка
    const {expenses, payments, currentUser} = useTripPageData(trip.id);
    const total = totalAmount(expenses);
    const myBalance = currentUser
        ? calculateSettlement(trip.members, expenses, payments).remaining[currentUser.id] ?? 0
        : 0;

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

            <section className="trip-header__hero" aria-label="Підсумок подорожі">
                <div className="trip-header__hero-caption">{trip.name}{dates && ` · ${dates}`}</div>
                <div className="trip-header__hero-total">
                    {formatMoney(total)} <span className="trip-header__hero-currency">₴</span>
                </div>
                <div className="trip-header__hero-balance">
                    Твій баланс{' '}
                    <span className={myBalance > 0
                        ? 'trip-header__hero-balance-value trip-header__hero-balance-value--positive'
                        : 'trip-header__hero-balance-value'}>
                        {formatSignedMoney(myBalance)} ₴
                    </span>
                </div>
            </section>

            {mobileSummary && <div className="trip-header__mobile-summary">{mobileSummary}</div>}

            <nav aria-label="Розділи подорожі" className="trip-header__tabs">
                <NavLink to={`/trips/${trip.id}`} end className={tabClass}>Витрати</NavLink>
                <NavLink to={`/trips/${trip.id}/settle`} className={tabClass}>Розрахунок</NavLink>
                <NavLink to={`/trips/${trip.id}/members`} className={tabClass}>Учасники · {trip.members.length}</NavLink>
            </nav>

            {/* портал у body: інакше transform сторінки (.page-appear) ламає position: fixed */}
            {createPortal(
                <button type="button" className="trip-header__fab" aria-label="Додати витрату" onClick={onAddExpense}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" aria-hidden="true">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                </button>,
                document.body
            )}
        </header>
    );
};
