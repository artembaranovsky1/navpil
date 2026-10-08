import './TripsPage.scss'
import {flattenTrips, getTrips, type TripResponse} from "../../api/trips.ts";
import {useEffect, useState} from "react";
import {getMe} from "../../api/user.ts";
import {Button} from "../../components/Button/Button.tsx";
import {useNavigate} from "react-router";
import {ActiveBlock} from "./components/ActiveBlock.tsx";
import {Trip} from "./components/Trip.tsx";


export const TripsPage = () => {
    const [trips, setTrips] = useState<TripResponse[]>([])
    const [userName, setUserName] = useState<string>()

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        const loadTrips = async () => {
            try {
                const [data, user] = await Promise.all([getTrips(), getMe()])

                setTrips(flattenTrips(data))
                setUserName(user.name)
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
    const upcommingTrips = trips.filter((trip) => trip.status === "upcoming")

    if (isLoading) {
        return <p>Завантаження…</p>;
    }

    if (error) {
        return <p role="alert">{error}</p>;
    }

    if (trips.length === 0) {
        return <p>Ще жодної подорожі</p>;
    }

    const now = new Date();

    const formattedDate: string = now.toLocaleDateString('uk-UA', {
        weekday: 'long',   // день тижня (наприклад, "середа")
        month: 'long',     // місяц ("жовтня")
        day: 'numeric'     // день ("7")
    });

    return <div className="content">
        <div className="my-trip__info">
            <div className="my-trip__info-left">
                <div className='my-trip__info-date text-body text-col-muted'>{formattedDate}</div>
                <div className='my-trip__info-hello text-h3'>Привіт, {userName}</div>
            </div>
            <div className="my-trip__info-right">
                <Button variant='white' onClick={() => navigate('/join')}>Приєднатися за кодом</Button>
                <Button onClick={() => navigate('/trips/new', {replace: true})}>Нова подорож</Button>
            </div>
        </div>
        <div className="my-trip__statistics">
            <div className='my-trip__statistics-1'>
                <div className='my-trip__statistics-label text-body text-col-muted'>Тобі загалом винні</div>
                <div className='my-trip__statistics-text text-h5'>+2 800 ₴</div>
            </div>
            <div className='my-trip__statistics-1'>
                <div className='my-trip__statistics-label text-body text-col-muted'>Подорожей цього року</div>
                <div className='my-trip__statistics-text text-h5'>3</div>
            </div>
            <div className='my-trip__statistics-1'>
                <div className='my-trip__statistics-label text-body text-col-muted'>Витрачено разом</div>
                <div className='my-trip__statistics-text text-h5'>20 470 ₴</div>
            </div>
        </div>

        <div className='my-trip__active'>
            <div className='my-trip__active-text'>Зараз</div>
            {activeTrips.map((trip) => (
                <ActiveBlock key={trip.id} trip={trip}/>
            ))}
        </div>

        <div className='my-trip__upcomming'>
            <div className='my-trip__active-text'>Майбутні</div>
            <div className='my-trip__list'>
                {upcommingTrips.map((trip) => (
                    <Trip key={trip.id} trip={trip}/>
                ))}
            </div>
        </div>

        <div className='my-trip__past'>
            <div className='my-trip__active-text'>Минулі</div>
            <div className='my-trip__list'>
                {pastTrips.map((trip) => (
                    <Trip key={trip.id} trip={trip}/>
                ))}
            </div>
        </div>
    </div>
};
