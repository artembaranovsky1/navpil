import "./NewExpense.scss";
import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {Button} from "../Button/Button.tsx";
import {
    CATEGORY_LABELS,
    EXPENSE_CATEGORIES,
    type ExpenseCategory
} from "../../api/expense.ts";
import {useCreateExpense} from "../../hooks/mutations.ts";
import type {TripMember} from "../../api/trips.ts";
import {ApiError} from "../../api/ApiError.ts";
import {
    EXPENSE_DESCRIPTION_MAX,
    EXPENSE_NAME_MAX,
    type FieldErrors,
    parseAmount,
    validateExpense
} from "../../utils/expenseValidation.ts";

type NewExpenseProps = {
    tripId: string;
    members: TripMember[];
    currentUserId?: string;
    onClose: () => void;
}

const todayString = (): string => new Date().toISOString().slice(0, 10);

const formatShare = (amount: number): string =>
    amount.toLocaleString('uk-UA', {maximumFractionDigits: 2});

export const NewExpense = ({tripId, members, currentUserId, onClose}: NewExpenseProps) => {
    const [price, setPrice] = useState<string>('');
    const [date, setDate] = useState<string>(todayString);
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [category, setCategory] = useState<ExpenseCategory>();
    const [paidById, setPaidById] = useState<string | undefined>(currentUserId ?? members[0]?.id);
    const [splitBetween, setSplitBetween] = useState<string[]>(() => members.map((member) => member.id));

    const createExpense = useCreateExpense(tripId);
    const isLoading = createExpense.isPending;
    const [error, setError] = useState<string>('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const amount = parseAmount(price);
    const share = amount > 0 && splitBetween.length > 0 ? amount / splitBetween.length : 0;

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
        ['new-expense__input', extra, fieldErrors[field] && 'new-expense__input--invalid'].filter(Boolean).join(' ');

    const fieldError = (field: string) => fieldErrors[field] && (
        <p id={`new-expense-${field}-error`} className="new-expense__error">{fieldErrors[field][0]}</p>
    );

    const errorProps = (field: string) => ({
        'aria-invalid': Boolean(fieldErrors[field]),
        'aria-describedby': fieldErrors[field] ? `new-expense-${field}-error` : undefined,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        const errors = validateExpense({price, date, name, description, category, splitBetween});
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0 || !category) return;

        try {
            await createExpense.mutateAsync({
                name: name.trim(),
                description: description.trim() || undefined,
                amount,
                category,
                date,
                paidById,
                splitBetween,
            });

            onClose();
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                setFieldErrors((err.details ?? {}) as FieldErrors);
            } else if (err instanceof ApiError && err.status === 403) {
                setError('Ви не учасник цієї подорожі');
            } else if (err instanceof ApiError) {
                setError('Не вдалося додати витрату, спробуйте ще раз');
            } else {
                setError('Немає з’єднання з сервером');
            }
        }
    };

    // портал у body: інакше transform батьківської сторінки (.page-appear) обрізає fixed-фон
    return createPortal(
        <div className="new-expense__backdrop" onClick={onClose}>
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-expense-title"
                className="new-expense"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="new-expense__header">
                    <h2 id="new-expense-title" className="new-expense__title">Нова витрата</h2>
                    <button type="button" className="new-expense__close" aria-label="Закрити" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18"/>
                        </svg>
                    </button>
                </div>

                <form className="new-expense__form" onSubmit={handleSubmit} noValidate>
                    <div className="new-expense__row">
                        <div className="new-expense__field">
                            <label htmlFor="new-expense-amount" className="new-expense__label">Сума, ₴</label>
                            <input
                                id="new-expense-amount"
                                className={inputClass('amount', 'new-expense__input--amount')}
                                type="text"
                                inputMode="decimal"
                                placeholder="0"
                                value={price}
                                onChange={(event) => {
                                    setPrice(event.target.value);
                                    clearFieldError('amount');
                                }}
                                disabled={isLoading}
                                autoFocus
                                {...errorProps('amount')}
                            />
                            {fieldError('amount')}
                        </div>

                        <div className="new-expense__field">
                            <label htmlFor="new-expense-date" className="new-expense__label">Дата</label>
                            <input
                                id="new-expense-date"
                                className={inputClass('date')}
                                type="date"
                                value={date}
                                onChange={(event) => {
                                    setDate(event.target.value);
                                    clearFieldError('date');
                                }}
                                disabled={isLoading}
                                {...errorProps('date')}
                            />
                            {fieldError('date')}
                        </div>
                    </div>

                    <div className="new-expense__field">
                        <label htmlFor="new-expense-name" className="new-expense__label">За що</label>
                        <input
                            id="new-expense-name"
                            className={inputClass('name', 'new-expense__input--name')}
                            type="text"
                            maxLength={EXPENSE_NAME_MAX}
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                clearFieldError('name');
                            }}
                            disabled={isLoading}
                            {...errorProps('name')}
                        />
                        {fieldError('name')}
                    </div>

                    <div className="new-expense__field">
                        <label htmlFor="new-expense-description" className="new-expense__label">Опис</label>
                        <textarea
                            id="new-expense-description"
                            className={inputClass('description', 'new-expense__input--textarea')}
                            rows={2}
                            maxLength={EXPENSE_DESCRIPTION_MAX}
                            placeholder="Необов’язково"
                            value={description}
                            onChange={(event) => {
                                setDescription(event.target.value);
                                clearFieldError('description');
                            }}
                            disabled={isLoading}
                            {...errorProps('description')}
                        />
                        {fieldError('description')}
                    </div>

                    <fieldset className="new-expense__fieldset">
                        <legend className="new-expense__label new-expense__legend">Категорія</legend>
                        <div className="new-expense__chips">
                            {EXPENSE_CATEGORIES.map((cat) => (
                                <label
                                    key={cat}
                                    className={cat === category ? 'new-expense__chip new-expense__chip--active' : 'new-expense__chip'}
                                >
                                    <input
                                        type="radio"
                                        name="category"
                                        value={cat}
                                        checked={cat === category}
                                        onChange={() => {
                                            setCategory(cat);
                                            clearFieldError('category');
                                        }}
                                        disabled={isLoading}
                                    />
                                    {CATEGORY_LABELS[cat]}
                                </label>
                            ))}
                        </div>
                        {fieldError('category')}
                    </fieldset>

                    <div className="new-expense__row new-expense__row--wide-gap">
                        <fieldset className="new-expense__fieldset">
                            <legend className="new-expense__label new-expense__legend">Хто платив</legend>
                            <div className="new-expense__options">
                                {members.map((member) => (
                                    <label
                                        key={member.id}
                                        className={member.id === paidById ? 'new-expense__option new-expense__option--active' : 'new-expense__option'}
                                    >
                                        <input
                                            type="radio"
                                            name="paidBy"
                                            checked={member.id === paidById}
                                            onChange={() => setPaidById(member.id)}
                                            disabled={isLoading}
                                        />
                                        {member.name}
                                    </label>
                                ))}
                            </div>
                            {fieldError('paidById')}
                        </fieldset>

                        <fieldset className="new-expense__fieldset">
                            <legend className="new-expense__label new-expense__legend">Ділимо між · порівну</legend>
                            <div className="new-expense__options">
                                {members.map((member) => {
                                    const isSelected = splitBetween.includes(member.id);

                                    return (
                                        <label key={member.id} className="new-expense__option">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleMember(member.id)}
                                                disabled={isLoading}
                                            />
                                            <span className="new-expense__option-name">{member.name}</span>
                                            {isSelected && share > 0 && (
                                                <span className="new-expense__share">{formatShare(share)}</span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                            {fieldError('splitBetween')}
                        </fieldset>
                    </div>

                    {error && (
                        <p className="new-expense__error" role="alert">{error}</p>
                    )}

                    <div className="new-expense__actions">
                        <Button variant="secondary" size="lg" onClick={onClose} disabled={isLoading}>
                            Скасувати
                        </Button>
                        <Button type="submit" size="lg" loading={isLoading}>
                            Зберегти витрату
                        </Button>
                    </div>
                </form>
            </section>
        </div>,
        document.body
    )
}
