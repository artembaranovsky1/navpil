import './TripsPage.scss'
import {flattenTrips, getTrips, getTripsSummary, type TripResponse, type TripsSummaryResponse} from "../../api/trips.ts";
import {useEffect, useState} from "react";
import {getMe} from "../../api/user.ts";
import {Button} from "../../components/Button/Button.tsx";
import {useNavigate} from "react-router";
import {ActiveBlock} from "./components/ActiveBlock.tsx";
import {Trip} from "./components/Trip.tsx";
import {formattedDate} from "../../../function/date.tsx";
import {formatMoney, formatSignedMoney} from "../../utils/format.ts";
import {TripsPageSkeleton} from "../../components/Skeleton/PageSkeletons.tsx";

export const TripsPage = () => {
    const [trips, setTrips] = useState<TripResponse[]>([])
    const [userName, setUserName] = useState<string>()
    const [summary, setSummary] = useState<TripsSummaryResponse | null>(null)

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        const loadTrips = async () => {
            try {
                const [data, user, summaryData] = await Promise.all([
                    getTrips(),
                    getMe(),
                    // без підсумків сторінка все одно працює — замість цифр буде «—»
                    getTripsSummary().catch(() => null),
                ])

                setTrips(flattenTrips(data))
                setUserName(user.name)
                setSummary(summaryData)
            } catch {
                setError('Не вдалося завантажити подорожі')
            } finally {
                setIsLoading(false)
            }
        }

        loadTrips()
    }, []);

    const navigate = useNavigate();

    const activeTrips: TripResponse[] = trips.filter((trip) => trip.status === "active")
    const pastTrips = trips.filter((trip) => trip.status === "past")
    const upcomingTrips = trips.filter((trip) => trip.status === "upcoming")

    const myBalance = summary?.myBalance ?? 0

    if (isLoading) {
        return <TripsPageSkeleton/>;
    }

    if (error) {
        return <p role="alert">{error}</p>;
    }

    return <div className="trips-page page-appear">
        <header className="trips-page__header">
            <div>
                <div className='trips-page__date'>{formattedDate}</div>
                <h1 className='trips-page__hello'>Привіт, {userName}</h1>
            </div>
            <div className="trips-page__actions">
                <Button variant='white' onClick={() => navigate('/join')}>Приєднатися за кодом</Button>
                <Button onClick={() => navigate('/trips/new')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" aria-hidden="true">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Нова подорож
                </Button>
            </div>
        </header>

        <div className="trips-page__stats">
            <div className='trips-page__stat'>
                <div className='trips-page__stat-label'>
                    {myBalance < 0 ? 'Ти загалом маєш віддати' : 'Тобі загалом винні'}
                </div>
                <div className={myBalance > 0
                    ? 'trips-page__stat-value trips-page__stat-value--positive'
                    : 'trips-page__stat-value'}>
                    {summary ? `${formatSignedMoney(myBalance)} ₴` : '—'}
                </div>
            </div>
            <div className='trips-page__stat'>
                <div className='trips-page__stat-label'>Подорожей цього року</div>
                <div className='trips-page__stat-value'>{summary?.tripsThisYear ?? '—'}</div>
            </div>
            <div className='trips-page__stat'>
                <div className='trips-page__stat-label'>Витрачено разом</div>
                <div className='trips-page__stat-value'>{summary ? `${formatMoney(summary.totalSpent)} ₴` : '—'}</div>
            </div>
        </div>

        {trips.length === 0 && (
            <section className="trips-page__empty">
                <div className="trips-page__empty-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 20h18M5 20V10l7-5 7 5v10M10 20v-5h4v5"/>
                    </svg>
                </div>
                <h2 className="trips-page__empty-title">Поки що жодної подорожі</h2>
                <p className="trips-page__empty-text">
                    Створи нову подорож і запроси друзів або приєднайся до існуючої за кодом.
                </p>
                <Button onClick={() => navigate('/trips/new')}>Створити подорож</Button>
            </section>
        )}

        {activeTrips.length > 0 && (
            <section className='trips-page__section'>
                <h2 className='trips-page__section-title'>Зараз</h2>
                {activeTrips.map((trip) => (
                    <ActiveBlock key={trip.id} trip={trip} summary={summary?.trips[trip.id]}/>
                ))}
            </section>
        )}

        {upcomingTrips.length > 0 && (
            <section className='trips-page__section'>
                <h2 className='trips-page__section-title'>
                    Майбутні <span className='trips-page__section-count'>{upcomingTrips.length}</span>
                </h2>
                <div className='trips-page__grid'>
                    {upcomingTrips.map((trip) => (
                        <Trip key={trip.id} trip={trip}/>
                    ))}
                </div>
            </section>
        )}

        {pastTrips.length > 0 && (
            <section className='trips-page__section'>
                <h2 className='trips-page__section-title'>
                    Минулі <span className='trips-page__section-count'>{pastTrips.length}</span>
                </h2>
                <div className='trips-page__grid'>
                    {pastTrips.map((trip) => (
                        <Trip key={trip.id} trip={trip}/>
                    ))}
                </div>
            </section>
        )}
    </div>
};
