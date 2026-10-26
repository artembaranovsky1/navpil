import '../TripExpensesPage/components/EditExpense/EditExpense.scss'
import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {Button} from "../../components/Button/Button.tsx";
import type {TripResponse, UpdateTripData} from "../../api/trips.ts";
import {useUpdateTrip} from "../../hooks/mutations.ts";
import {ApiError} from "../../api/ApiError.ts";
import type {FieldErrors} from "../../utils/expenseValidation.ts";
import {TRIP_DESCRIPTION_MAX, TRIP_NAME_MAX, validateTrip} from "../../utils/tripValidation.ts";

type EditTripProps = {
    trip: TripResponse;
    onUpdated: () => void;
    onClose: () => void;
}

export const EditTrip = ({trip, onUpdated, onClose}: EditTripProps) => {

    const [name, setName] = useState<string>(trip.name);
    const [description, setDescription] = useState<string>(trip.description ?? '');
    const [startDate, setStartDate] = useState<string>(trip.startDate ?? '');
    const [endDate, setEndDate] = useState<string>(trip.endDate ?? '');
    const [error, setError] = useState<string>('')
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const updateTrip = useUpdateTrip(trip.id)
    const isSaving = updateTrip.isPending

    // прибираємо помилку поля, щойно юзер його змінив
    const clearFieldError = (...fields: string[]) => {
        setFieldErrors((prev) => {
            if (!fields.some((field) => prev[field])) return prev;
            const next = {...prev};
            fields.forEach((field) => delete next[field]);
            return next;
        });
    };

    const inputClass = (field: string, extra = '') =>
        ['edit-expense__input', extra, fieldErrors[field] && 'edit-expense__input--invalid'].filter(Boolean).join(' ');

    const fieldError = (field: string) => fieldErrors[field] && (
        <p id={`edit-trip-${field}-error`} className="edit-expense__error">{fieldErrors[field][0]}</p>
    );

    const errorProps = (field: string) => ({
        'aria-invalid': Boolean(fieldErrors[field]),
        'aria-describedby': fieldErrors[field] ? `edit-trip-${field}-error` : undefined,
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        // 1. Перевірка на фронті, щоб не слати явно поганий запит
        const errors = validateTrip({name, description, startDate, endDate});
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        // 2. Збираємо дані для сервера; порожня дата — прибрати її
        const changes: UpdateTripData = {
            name: name.trim(),
            description: description.trim(),
            startDate: startDate || null,
            endDate: endDate || null,
        };


        // 3. Відправляємо й обробляємо результат
        try {
            await updateTrip.mutateAsync(changes);
            onUpdated();
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                setFieldErrors((err.details ?? {}) as FieldErrors);
            } else if (err instanceof ApiError && err.status === 401) {
                // редірект на /login робить ProtectedRoutes
            } else if (err instanceof ApiError && err.status === 403) {
                setError('Ви не можете редагувати цю подорож');
            } else if (err instanceof ApiError && err.status === 404) {
                setError('Подорож не знайдено — можливо, її вже видалили');
            } else if (err instanceof ApiError) {
                setError('Не вдалося зберегти, спробуйте ще раз');
            } else {
                setError('Немає з’єднання з сервером');
            }
        }
    };

    // портал у body: інакше transform батьківської сторінки (.page-appear) обрізає fixed-фон
    return createPortal(
        <div className="edit-expense__backdrop" onClick={onClose}>
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-trip-title"
                className="edit-expense"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="edit-expense__header">
                    <h2 id="edit-trip-title" className="edit-expense__title">Редагувати подорож</h2>
                    <button type="button" className="edit-expense__close" aria-label="Закрити" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18"/>
                        </svg>
                    </button>
                </div>

                <form className="edit-expense__form" onSubmit={handleSubmit} noValidate>
                    <div className="edit-expense__field">
                        <label htmlFor="edit-trip-name" className="edit-expense__label">Назва</label>
                        <input
                            id="edit-trip-name"
                            className={inputClass('name', 'edit-expense__input--name')}
                            type="text"
                            autoComplete="off"
                            maxLength={TRIP_NAME_MAX}
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                clearFieldError('name');
                            }}
                            disabled={isSaving}
                            autoFocus
                            {...errorProps('name')}
                        />
                        {fieldError('name')}
                    </div>

                    <div className="edit-expense__field">
                        <label htmlFor="edit-trip-description" className="edit-expense__label">Опис</label>
                        <textarea
                            id="edit-trip-description"
                            className={inputClass('description', 'edit-expense__input--textarea')}
                            rows={3}
                            maxLength={TRIP_DESCRIPTION_MAX}
                            placeholder="Необов’язково"
                            value={description}
                            onChange={(event) => {
                                setDescription(event.target.value);
                                clearFieldError('description');
                            }}
                            disabled={isSaving}
                            {...errorProps('description')}
                        />
                        {fieldError('description')}
                    </div>

                    <div className="edit-expense__row">
                        <div className="edit-expense__field">
                            <label htmlFor="edit-trip-startDate" className="edit-expense__label">Початок</label>
                            <input
                                id="edit-trip-startDate"
                                className={inputClass('startDate')}
                                type="date"
                                value={startDate}
                                onChange={(event) => {
                                    setStartDate(event.target.value);
                                    clearFieldError('startDate', 'endDate');
                                }}
                                disabled={isSaving}
                                {...errorProps('startDate')}
                            />
                            {fieldError('startDate')}
                        </div>

                        <div className="edit-expense__field">
                            <label htmlFor="edit-trip-endDate" className="edit-expense__label">Кінець</label>
                            <input
                                id="edit-trip-endDate"
                                className={inputClass('endDate')}
                                type="date"
                                min={startDate || undefined}
                                value={endDate}
                                onChange={(event) => {
                                    setEndDate(event.target.value);
                                    clearFieldError('endDate');
                                }}
                                disabled={isSaving}
                                {...errorProps('endDate')}
                            />
                            {fieldError('endDate')}
                        </div>
                    </div>

                    {error && (
                        <p className="edit-expense__error" role="alert">{error}</p>
                    )}

                    <div className="edit-expense__actions">
                        <Button variant="secondary" size="lg" onClick={onClose} disabled={isSaving}>
                            Скасувати
                        </Button>
                        <Button type="submit" size="lg" loading={isSaving}>
                            Зберегти зміни
                        </Button>
                    </div>
                </form>
            </section>
        </div>,
        document.body
    );
};
