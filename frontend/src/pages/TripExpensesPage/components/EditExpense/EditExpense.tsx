import './EditExpense.scss'
import {useEffect, useState} from "react";
import {Button} from "../../../../components/Button/Button.tsx";
import {
    CATEGORY_LABELS,
    EXPENSE_CATEGORIES,
    type ExpenseCategory,
    type ExpenseResponse,
    updateExpense,
    type UpdateExpenseData
} from "../../../../api/expense.ts";
import type {TripMember} from "../../../../api/trips.ts";
import {ApiError} from "../../../../api/ApiError.ts";
import {useNavigate} from "react-router";

type FieldErrors = Record<string, string[]>;

// "1 740,5" -> 1740.5
const parseAmount = (value: string): number => Number(value.replace(/\s/g, '').replace(',', '.'));

type EditExpenseProps = {
    tripId: string;
    expense: ExpenseResponse;
    members: TripMember[];
    onUpdated: (expense: ExpenseResponse) => void;
    onClose: () => void;
}

export const EditExpense = ({tripId, expense, members, onUpdated, onClose}: EditExpenseProps) => {
    const navigate = useNavigate();

    const [price, setPrice] = useState<string>(String(expense.amount));
    const [date, setDate] = useState<string>((expense.date ?? expense.createdAt).slice(0, 10));
    const [name, setName] = useState<string>(expense.name);
    const [description, setDescription] = useState<string>(expense.description ?? '');
    const [category, setCategory] = useState<ExpenseCategory>(expense.category);
    const [paidById, setPaidById] = useState<string>(expense.paidById ?? expense.addedById);
    const [splitBetween, setSplitBetween] = useState<string[]>(
        expense.splitBetween.length > 0 ? expense.splitBetween : members.map((member) => member.id)
    );
    const [error, setError] = useState<string>('')
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const toggleMember = (memberId: string) => {
        setSplitBetween((current) =>
            current.includes(memberId)
                ? current.filter((id) => id !== memberId)
                : [...current, memberId]
        );
    };

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
        setFieldErrors({});

        // 1. Проста перевірка на фронті, щоб не слати явно поганий запит
        const amountNumber = parseAmount(price);

        if (!price.trim() || Number.isNaN(amountNumber) || amountNumber <= 0) {
            setFieldErrors({ amount: ['Вкажіть суму більшу за 0'] });
            return;
        }

        if (splitBetween.length === 0) {
            setFieldErrors({ splitBetween: ['Оберіть хоча б одного учасника'] });
            return;
        }

        // 2. Збираємо дані для сервера
        const changes: UpdateExpenseData = {
            name: name.trim(),
            description: description.trim() || undefined,
            amount: amountNumber,
            category,
            date: date || undefined,
            paidById: paidById || undefined,
            splitBetween,
        };

        setIsSaving(true);

        // 3. Відправляємо й обробляємо результат
        try {
            const updatedExpense = await updateExpense(tripId, expense.id, changes);
            onUpdated(updatedExpense);
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                setFieldErrors((err.details ?? {}) as FieldErrors);
            } else if (err instanceof ApiError && err.status === 401) {
                localStorage.removeItem('token');
                navigate('/login', { replace: true });
            } else if (err instanceof ApiError && err.status === 403) {
                setError('Ви не можете редагувати цю витрату');
            } else if (err instanceof ApiError && err.status === 404) {
                setError('Витрату не знайдено — можливо, її вже видалили');
            } else if (err instanceof ApiError) {
                setError('Не вдалося зберегти, спробуйте ще раз');
            } else {
                setError('Немає з’єднання з сервером');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="edit-expense__backdrop" onClick={onClose}>
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-expense-title"
                className="edit-expense"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="edit-expense__header">
                    <h2 id="edit-expense-title" className="edit-expense__title">Редагувати витрату</h2>
                    <button type="button" className="edit-expense__close" aria-label="Закрити" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18"/>
                        </svg>
                    </button>
                </div>

                <form className="edit-expense__form" onSubmit={handleSubmit} noValidate>
                    <div className="edit-expense__row">
                        <div className="edit-expense__field">
                            <label htmlFor="edit-expense-amount" className="edit-expense__label">Сума, ₴</label>
                            <input
                                id="edit-expense-amount"
                                className="edit-expense__input edit-expense__input--amount"
                                type="text"
                                inputMode="decimal"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                disabled={isSaving}
                            />
                            {fieldErrors.amount && (
                                <p className="edit-expense__error">{fieldErrors.amount[0]}</p>
                            )}
                        </div>

                        <div className="edit-expense__field">
                            <label htmlFor="edit-expense-date" className="edit-expense__label">Дата</label>
                            <input
                                id="edit-expense-date"
                                className="edit-expense__input"
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                disabled={isSaving}
                            />
                            {fieldErrors.date && (
                                <p className="edit-expense__error">{fieldErrors.date[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="edit-expense__field">
                        <label htmlFor="edit-expense-name" className="edit-expense__label">За що</label>
                        <input
                            id="edit-expense-name"
                            className="edit-expense__input edit-expense__input--name"
                            type="text"
                            maxLength={20}
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            disabled={isSaving}
                        />
                        {fieldErrors.name && (
                            <p className="edit-expense__error">{fieldErrors.name[0]}</p>
                        )}
                    </div>

                    <div className="edit-expense__field">
                        <label htmlFor="edit-expense-description" className="edit-expense__label">Опис</label>
                        <textarea
                            id="edit-expense-description"
                            className="edit-expense__input edit-expense__input--textarea"
                            rows={2}
                            maxLength={200}
                            placeholder="Необов’язково"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            disabled={isSaving}
                        />
                        {fieldErrors.description && (
                            <p className="edit-expense__error">{fieldErrors.description[0]}</p>
                        )}
                    </div>

                    <fieldset className="edit-expense__fieldset">
                        <legend className="edit-expense__label edit-expense__legend">Категорія</legend>
                        <div className="edit-expense__chips">
                            {EXPENSE_CATEGORIES.map((cat) => (
                                <label
                                    key={cat}
                                    className={cat === category ? 'edit-expense__chip edit-expense__chip--active' : 'edit-expense__chip'}
                                >
                                    <input
                                        type="radio"
                                        name="edit-category"
                                        value={cat}
                                        checked={cat === category}
                                        onChange={() => setCategory(cat)}
                                        disabled={isSaving}
                                    />
                                    {CATEGORY_LABELS[cat]}
                                </label>
                            ))}
                        </div>
                        {fieldErrors.category && (
                            <p className="edit-expense__error">{fieldErrors.category[0]}</p>
                        )}
                    </fieldset>

                    <div className="edit-expense__row edit-expense__row--wide-gap">
                        <fieldset className="edit-expense__fieldset">
                            <legend className="edit-expense__label edit-expense__legend">Хто платив</legend>
                            <div className="edit-expense__options">
                                {members.map((member) => (
                                    <label
                                        key={member.id}
                                        className={member.id === paidById ? 'edit-expense__option edit-expense__option--active' : 'edit-expense__option'}
                                    >
                                        <input
                                            type="radio"
                                            name="edit-paidBy"
                                            checked={member.id === paidById}
                                            onChange={() => setPaidById(member.id)}
                                            disabled={isSaving}
                                        />
                                        {member.name}
                                    </label>
                                ))}
                            </div>
                            {fieldErrors.paidById && (
                                <p className="edit-expense__error">{fieldErrors.paidById[0]}</p>
                            )}
                        </fieldset>

                        <fieldset className="edit-expense__fieldset">
                            <legend className="edit-expense__label edit-expense__legend">Ділимо між · порівну</legend>
                            <div className="edit-expense__options">
                                {members.map((member) => (
                                    <label key={member.id} className="edit-expense__option">
                                        <input
                                            type="checkbox"
                                            checked={splitBetween.includes(member.id)}
                                            onChange={() => toggleMember(member.id)}
                                            disabled={isSaving}
                                        />
                                        <span className="edit-expense__option-name">{member.name}</span>
                                    </label>
                                ))}
                            </div>
                            {fieldErrors.splitBetween && (
                                <p className="edit-expense__error">{fieldErrors.splitBetween[0]}</p>
                            )}
                        </fieldset>
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
        </div>
    );
};
