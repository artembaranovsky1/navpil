import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/Button/Button.tsx";
import { createTrip } from "../api/trips.ts";
import { ApiError } from "../api/ApiError.ts";

// Мають збігатися з roomCreateSchema на бекенді
// const NAME_MIN = 1;
// const NAME_MAX = 100;
// const DESCRIPTION_MAX = 500;

type FieldErrors = Record<string, string[]>;

export const NewTripPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
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
            await createTrip(name.trim(), description.trim() || undefined);

            navigate('/trips', { replace: true });
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                setFieldErrors((err.details ?? {}) as FieldErrors);
            } else if (err instanceof ApiError && err.status === 401) {
                localStorage.removeItem('token');
                navigate('/login', { replace: true });
            } else if (err instanceof ApiError) {
                setError('Не вдалося створити подорож, спробуйте ще раз');
            } else {
                setError('Немає з’єднання з сервером');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="new-trip">
            <h1 className="new-trip__title text-h6">Нова подорож</h1>

            <form className="new-trip__form" onSubmit={handleSubmit}>
                <div className="new-trip__field">
                    <label className="text-body" htmlFor="new-trip-name">Назва</label>
                    <input
                        id="new-trip-name"
                        className="input"
                        type="text"
                        autoComplete="off"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={isLoading}
                        // minLength={NAME_MIN}
                        // maxLength={NAME_MAX}
                        required
                    />
                    {fieldErrors.name && (
                        <p className="new-trip__field-error text-small">{fieldErrors.name[0]}</p>
                    )}
                </div>

                <div className="new-trip__field">
                    <label className="text-body" htmlFor="new-trip-description">
                        Опис (необов’язково)
                    </label>
                    <textarea
                        id="new-trip-description"
                        className="input new-trip__textarea"
                        rows={3}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        disabled={isLoading}
                        // maxLength={DESCRIPTION_MAX}
                    />
                    {fieldErrors.description && (
                        <p className="new-trip__field-error text-small">{fieldErrors.description[0]}</p>
                    )}
                </div>

                {error && (
                    <p className="new-trip__error" role="alert">
                        {error}
                    </p>
                )}

                <Button type="submit" size="lg" loading={isLoading}>
                    Створити
                </Button>
            </form>

            <Link className="text-link new-trip__cancel" to="/trips">
                Скасувати
            </Link>
        </div>
    );
};