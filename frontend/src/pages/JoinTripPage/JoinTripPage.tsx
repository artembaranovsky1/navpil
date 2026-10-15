import '../../components/Input/Input.scss';
import './JoinTripPage.scss';
import {useState} from "react";
import {joinTrip} from "../../api/trips.ts";
import {ApiError} from "../../api/ApiError.ts";
import {Button} from "../../components/Button/Button.tsx";
import {Link, useNavigate, useSearchParams} from "react-router";

const CODE_LENGTH = 6;

// лишаємо тільки латинські літери й цифри: "krp 482" -> "KRP482"
const normalizeCode = (value: string): string =>
    value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);

export const JoinTripPage = () => {
    const [searchParams] = useSearchParams();
    // посилання-запрошення: /join?code=KRP482
    const [code, setCode] = useState(normalizeCode(searchParams.get('code') ?? ''));
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

    return (
        <div className="join-trip">
            <Link className="join-trip__back" to="/trips">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 12H5M11 18l-6-6 6-6"/>
                </svg>
                Мої подорожі
            </Link>

            <form className="join-trip__card" onSubmit={handleSubmit}>
                <div className="join-trip__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="9" cy="8" r="3.5"/>
                        <path d="M2.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6"/>
                    </svg>
                </div>
                <h1 className="join-trip__title">Приєднатися до подорожі</h1>
                <p className="join-trip__subtitle">
                    Введи код, який тобі надіслав організатор. Після цього побачиш усі витрати й зможеш додавати свої.
                </p>

                <label className="join-trip__label" htmlFor="join-code">Код запрошення</label>
                <input
                    id="join-code"
                    className={error ? 'input input-danger join-trip__code' : 'input join-trip__code'}
                    value={code}
                    onChange={(e) => {
                        setCode(normalizeCode(e.target.value));
                        setError('');
                    }}
                    placeholder="ABC123"
                    maxLength={CODE_LENGTH}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    disabled={isLoading}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'join-code-error' : 'join-code-hint'}
                    autoFocus
                    required
                />

                {error
                    ? <p id="join-code-error" className="join-trip__error" role="alert">{error}</p>
                    : <p id="join-code-hint" className="join-trip__hint">{code.length}/{CODE_LENGTH} символів</p>}

                <div className="join-trip__actions">
                    <Button type="submit" size="lg" loading={isLoading} disabled={code.length !== CODE_LENGTH}>
                        Приєднатися
                    </Button>
                    <Link className="join-trip__cancel" to="/trips">Скасувати</Link>
                </div>
            </form>

            <p className="join-trip__alt">
                Немає коду? <Link to="/trips/new">Створи свою подорож</Link>
            </p>
        </div>
    );
};
