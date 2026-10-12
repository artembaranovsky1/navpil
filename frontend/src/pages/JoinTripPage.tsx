import {useState} from "react";
import {joinTrip} from "../api/trips.ts";
import {ApiError} from "../api/ApiError.ts";
import {Button} from "../components/Button/Button.tsx";
import {Link, useNavigate} from "react-router";

export const JoinTripPage = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const trip = await joinTrip(code);
            navigate(`/trips/${trip.id}`, { replace: true });
        } catch (err) {
            if (err instanceof ApiError && err.status === 404) {
                setError('Подорож з таким кодом не знайдено');
            } else if (err instanceof ApiError && err.status === 422) {
                setError('Код має містити 6 символів');
            } else if (err instanceof ApiError && err.status === 401) {
                localStorage.removeItem('token');
                navigate('/login', { replace: true });
            } else {
                setError('Немає з’єднання з сервером');
            }
        } finally {
            setIsLoading(false);
        }
    };


    return <form onSubmit={handleSubmit}>
        <h1>Приєднатися до подорожі</h1>

        <label htmlFor="join-code">Код запрошення</label>
        <input
            id="join-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            autoComplete="off"
            disabled={isLoading}
            required
        />

        {error && <p role="alert">{error}</p>}

        <Button type="submit" loading={isLoading}>Приєднатися</Button>
        <Link to="/trips">Скасувати</Link>
    </form>;
};