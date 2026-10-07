import {getTrips, type TripResponse} from "../../api/trips.ts";
import {useEffect, useState} from "react";


export const TripsPage = () => {
    const [trips, setTrips] = useState<TripResponse[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        const loadTrips = async () => {
            try {
                const data = await getTrips()
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
    </div>
};
