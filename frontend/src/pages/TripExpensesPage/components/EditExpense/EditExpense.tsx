import './EditExpense.scss'
import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {Button} from "../../../../components/Button/Button.tsx";
import {
    CATEGORY_LABELS,
    EXPENSE_CATEGORIES,
    type ExpenseCategory,
    type ExpenseResponse,
    type UpdateExpenseData
} from "../../../../api/expense.ts";
import {useUpdateExpense} from "../../../../hooks/mutations.ts";
import type {TripMember} from "../../../../api/trips.ts";
import {ApiError} from "../../../../api/ApiError.ts";
import {
    EXPENSE_DESCRIPTION_MAX,
    EXPENSE_NAME_MAX,
    type FieldErrors,
    parseAmount,
    validateExpense
} from "../../../../utils/expenseValidation.ts";

type EditExpenseProps = {
    tripId: string;
    expense: ExpenseResponse;
    members: TripMember[];
    onUpdated: () => void;
    onClose: () => void;
}

export const EditExpense = ({tripId, expense, members, onUpdated, onClose}: EditExpenseProps) => {

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
    const updateExpense = useUpdateExpense(tripId, expense.id)
    const isSaving = updateExpense.isPending

    // прибираємо помилку поля, щойно юзер його змінив
    const clearFieldError = (field: string) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = {...prev};
            delete next[field];
            return next;
        });
    };

    const toggleMember = (memberId: string) => {
        setSplitBetween((current) =>
            current.includes(memberId)
                ? current.filter((id) => id !== memberId)
                : [...current, memberId]
        );
        clearFieldError('splitBetween');
    };

    const inputClass = (field: string, extra = '') =>
        ['edit-expense__input', extra, fieldErrors[field] && 'edit-expense__input--invalid'].filter(Boolean).join(' ');

    const fieldError = (field: string) => fieldErrors[field] && (
        <p id={`edit-expense-${field}-error`} className="edit-expense__error">{fieldErrors[field][0]}</p>
    );

    const errorProps = (field: string) => ({
        'aria-invalid': Boolean(fieldErrors[field]),
        'aria-describedby': fieldErrors[field] ? `edit-expense-${field}-error` : undefined,
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
        const errors = validateExpense({price, date, name, description, category, splitBetween});
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        // 2. Збираємо дані для сервера
        const changes: UpdateExpenseData = {
            name: name.trim(),
            description: description.trim() || undefined,
            amount: parseAmount(price),
            category,
            date,
            paidById: paidById || undefined,
            splitBetween,
        };


        // 3. Відправляємо й обробляємо результат
        try {
            await updateExpense.mutateAsync(changes);
            onUpdated();
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                setFieldErrors((err.details ?? {}) as FieldErrors);
            } else if (err instanceof ApiError && err.status === 401) {
                // редірект на /login робить ProtectedRoutes
            } else if (err instanceof ApiError && err.status === 403) {
                setError('Ви не можете редагувати цю витрату');
            } else if (err instanceof ApiError && err.status === 404) {
                setError('Витрату не знайдено — можливо, її вже видалили');
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
                                className={inputClass('amount', 'edit-expense__input--amount')}
                                type="text"
                                inputMode="decimal"
                                value={price}
                                onChange={(event) => {
                                    setPrice(event.target.value);
                                    clearFieldError('amount');
                                }}
                                disabled={isSaving}
                                {...errorProps('amount')}
                            />
                            {fieldError('amount')}
                        </div>

                        <div className="edit-expense__field">
                            <label htmlFor="edit-expense-date" className="edit-expense__label">Дата</label>
                            <input
                                id="edit-expense-date"
                                className={inputClass('date')}
                                type="date"
                                value={date}
                                onChange={(event) => {
                                    setDate(event.target.value);
                                    clearFieldError('date');
                                }}
                                disabled={isSaving}
                                {...errorProps('date')}
                            />
                            {fieldError('date')}
                        </div>
                    </div>

                    <div className="edit-expense__field">
                        <label htmlFor="edit-expense-name" className="edit-expense__label">За що</label>
                        <input
                            id="edit-expense-name"
                            className={inputClass('name', 'edit-expense__input--name')}
                            type="text"
                            maxLength={EXPENSE_NAME_MAX}
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                clearFieldError('name');
                            }}
                            disabled={isSaving}
                            {...errorProps('name')}
                        />
                        {fieldError('name')}
                    </div>

                    <div className="edit-expense__field">
                        <label htmlFor="edit-expense-description" className="edit-expense__label">Опис</label>
                        <textarea
                            id="edit-expense-description"
                            className={inputClass('description', 'edit-expense__input--textarea')}
                            rows={2}
                            maxLength={EXPENSE_DESCRIPTION_MAX}
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
                        {fieldError('category')}
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
                            {fieldError('paidById')}
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
                            {fieldError('splitBetween')}
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
        </div>,
        document.body
    );
};
