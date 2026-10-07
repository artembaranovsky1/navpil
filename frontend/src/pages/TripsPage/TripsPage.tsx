import '../TripsPage/TripsPage.scss'
import {getTrips, type TripResponse} from "../../api/trips.ts";
import {useEffect, useState} from "react";
import {getMe, type User} from "../../api/user.ts";



export const TripsPage = () => {
    const [trips, setTrips] = useState<TripResponse[]>([])
    const [user, setUser] = useState<User>()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        const loadTrips = async () => {
            try {
                const data = await getTrips()
                const user = await  getMe()

                setUser(user)
                setTrips(data)

            } catch {
                setError('Не вдалося завантажити подорожі')
            } finally {
                setIsLoading(false)
            }
        }

        loadTrips()
    }, []);

    if (isLoading) {
        return <p>Завантаження…</p>;
    }

    if (error) {
        return <p role="alert">{error}</p>;
    }

    if (trips.length === 0) {
        return <p>Ще жодної подорожі</p>;
    }


    return <div>
        <div className='trip-menu'>
            <div className='trip-menu__logo'></div>
            <div className='trip-menu__nav'>
                <div className='trip-menu__link'>
                    <div className='trip-menu__link-logo-1'></div>
                    <div className='trip-menu__link-text '>Мої подорожі</div>
                </div>
                <div className='trip-menu__link-disable'>
                    <div className='trip-menu__link-logo-2'></div>
                    <div className='trip-menu__link-text '>Приєднатися за кодом</div>
                </div>
            </div>
            <div className='trip-menu__travels'>
                <div className='trip-menu__travel-name text-caption'>Подорожі</div>
                <ul>
                    {trips.map((item) => (
                        <div key={item.id}
                             className='trip-menu__travel text-h15'
                        >
                            {item.name}
                        </div>
                    ))}
                </ul>
                <div className='trip-menu__travel text-h15'>Карпати</div>
                <div className='trip-menu__travel text-h15'>Львів на вихідні</div>
                <div className='trip-menu__travel text-h15'>Одеса</div>
            </div>
            <div className='trip-menu__user'>
                <div className='trip-menu__user-photo'>{user.name[0].toUpperCase()}</div>
                <div className='trip-menu__user-info'>
                    <div className='trip-menu__user-name'>{user.name}</div>
                    <div className='trip-menu__user-email'>{user.email}</div>
                </div>
            </div>
        </div>
    </div>

};