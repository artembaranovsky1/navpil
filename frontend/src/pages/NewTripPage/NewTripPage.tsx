import '../../components/Input/Input.scss';
import './NewTripPage.scss';
import {useState} from "react";
import {Link, useNavigate} from "react-router";
import {Button} from "../../components/Button/Button.tsx";
import {createTrip} from "../../api/trips.ts";
import {ApiError} from "../../api/ApiError.ts";

type FieldErrors = Record<string, string[]>;

// як у валідації на бекенді
const DESCRIPTION_MAX = 500;

export const NewTripPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setIsLoading(true);

        try {
            await createTrip({
                name: name.trim(),
                description: description.trim() || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });

            navigate('/trips', {replace: true});
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                setFieldErrors((err.details ?? {}) as FieldErrors);
            } else if (err instanceof ApiError && err.status === 401) {
                localStorage.removeItem('token');
                navigate('/login', {replace: true});
            } else if (err instanceof ApiError) {
                setError('Не вдалося створити подорож, спробуйте ще раз');
            } else {
                setError('Немає з’єднання з сервером');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = (field: string, extra = '') =>
        ['input', fieldErrors[field] && 'input-danger', extra].filter(Boolean).join(' ');

    const fieldError = (field: string) => fieldErrors[field] && (
        <p id={`new-trip-${field}-error`} className="new-trip__field-error">{fieldErrors[field][0]}</p>
    );

    return (
        <div className="new-trip">
            <Link className="new-trip__back" to="/trips">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 12H5M11 18l-6-6 6-6"/>
                </svg>
                Мої подорожі
            </Link>

            <div className="new-trip__card">
                <div className="new-trip__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 20h18M5 20V10l7-5 7 5v10M10 20v-5h4v5"/>
                    </svg>
                </div>
                <h1 className="new-trip__title">Нова подорож</h1>
                <p className="new-trip__subtitle">
                    Після створення отримаєш код, щоб запросити друзів і разом вести витрати.
                </p>

                <form className="new-trip__form" onSubmit={handleSubmit}>
                    <div className="new-trip__field">
                        <label className="new-trip__label" htmlFor="new-trip-name">Назва</label>
                        <input
                            id="new-trip-name"
                            className={inputClass('name')}
                            type="text"
                            autoComplete="off"
                            placeholder="Наприклад, Карпати"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            disabled={isLoading}
                            aria-invalid={Boolean(fieldErrors.name)}
                            aria-describedby={fieldErrors.name ? 'new-trip-name-error' : undefined}
                            autoFocus
                            required
                        />
                        {fieldError('name')}
                    </div>

                    <div className="new-trip__field">
                        <label className="new-trip__label" htmlFor="new-trip-description">
                            Опис <span className="new-trip__optional">· необов’язково</span>
                        </label>
                        <textarea
                            id="new-trip-description"
                            className={inputClass('description', 'new-trip__textarea')}
                            rows={3}
                            maxLength={DESCRIPTION_MAX}
                            placeholder="Куди їдемо і з ким"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            disabled={isLoading}
                            aria-invalid={Boolean(fieldErrors.description)}
                            aria-describedby={fieldErrors.description ? 'new-trip-description-error' : undefined}
                        />
                        <div className="new-trip__counter">{description.length}/{DESCRIPTION_MAX}</div>
                        {fieldError('description')}
                    </div>

                    <div className="new-trip__dates">
                        <div className="new-trip__field">
                            <label className="new-trip__label" htmlFor="new-trip-startDate">Початок</label>
                            <input
                                id="new-trip-startDate"
                                className={inputClass('startDate')}
                                type="date"
                                value={startDate}
                                onChange={(event) => setStartDate(event.target.value)}
                                disabled={isLoading}
                                aria-invalid={Boolean(fieldErrors.startDate)}
                                aria-describedby={fieldErrors.startDate ? 'new-trip-startDate-error' : undefined}
                            />
                            {fieldError('startDate')}
                        </div>
                        <div className="new-trip__field">
                            <label className="new-trip__label" htmlFor="new-trip-endDate">Кінець</label>
                            <input
                                id="new-trip-endDate"
                                className={inputClass('endDate')}
                                type="date"
                                min={startDate || undefined}
                                value={endDate}
                                onChange={(event) => setEndDate(event.target.value)}
                                disabled={isLoading}
                                aria-invalid={Boolean(fieldErrors.endDate)}
                                aria-describedby={fieldErrors.endDate ? 'new-trip-endDate-error' : undefined}
                            />
                            {fieldError('endDate')}
                        </div>
                    </div>
                    <p className="new-trip__hint">Дати можна не вказувати — додаси пізніше.</p>

                    {error && (
                        <p className="new-trip__error" role="alert">{error}</p>
                    )}

                    <div className="new-trip__actions">
                        <Button type="submit" size="lg" loading={isLoading}>
                            Створити подорож
                        </Button>
                        <Link className="new-trip__cancel" to="/trips">Скасувати</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};
