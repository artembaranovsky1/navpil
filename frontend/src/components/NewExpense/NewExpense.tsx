import "./NewExpense.scss";
import {useEffect, useState} from "react";
import {Button} from "../Button/Button.tsx";
import {
    CATEGORY_LABELS,
    createExpense,
    EXPENSE_CATEGORIES,
    type ExpenseCategory,
    type ExpenseResponse
} from "../../api/expense.ts";
import type {TripMember} from "../../api/trips.ts";
import {ApiError} from "../../api/ApiError.ts";

type FieldErrors = Record<string, string[]>;

type NewExpenseProps = {
    tripId: string;
    members: TripMember[];
    currentUserId?: string;
    onCreated: (expense: ExpenseResponse) => void;
    onClose: () => void;
}

const todayString = (): string => new Date().toISOString().slice(0, 10);

// "1 740,5" -> 1740.5
const parseAmount = (value: string): number => Number(value.replace(/\s/g, '').replace(',', '.'));

const formatShare = (amount: number): string =>
    amount.toLocaleString('uk-UA', {maximumFractionDigits: 2});

export const NewExpense = ({tripId, members, currentUserId, onCreated, onClose}: NewExpenseProps) => {
    const [price, setPrice] = useState<string>('');
    const [date, setDate] = useState<string>(todayString);
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [category, setCategory] = useState<ExpenseCategory>();
    const [paidById, setPaidById] = useState<string | undefined>(currentUserId ?? members[0]?.id);
    const [splitBetween, setSplitBetween] = useState<string[]>(() => members.map((member) => member.id));

    const [isLoading, setIsLoading] = useState<boolean>(false);
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

    const toggleMember = (memberId: string) => {
        setSplitBetween((current) =>
            current.includes(memberId)
                ? current.filter((id) => id !== memberId)
                : [...current, memberId]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        if (!(amount > 0)) {
            setFieldErrors({amount: ['Вкажіть суму більшу за 0']});
            return;
        }

        if (!category) {
            setFieldErrors({category: ['Оберіть категорію']});
            return;
        }

        if (splitBetween.length === 0) {
            setFieldErrors({splitBetween: ['Оберіть хоча б одного учасника']});
            return;
        }

        setIsLoading(true);

        try {
            const newExpense = await createExpense(tripId, {
                name: name.trim(),
                description: description.trim() || undefined,
                amount,
                category,
                date,
                paidById,
                splitBetween,
            });

            onCreated(newExpense);
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
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
                                className="new-expense__input new-expense__input--amount"
                                type="text"
                                inputMode="decimal"
                                placeholder="0"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                            {fieldErrors.amount && (
                                <p className="new-expense__error">{fieldErrors.amount[0]}</p>
                            )}
                        </div>

                        <div className="new-expense__field">
                            <label htmlFor="new-expense-date" className="new-expense__label">Дата</label>
                            <input
                                id="new-expense-date"
                                className="new-expense__input"
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                disabled={isLoading}
                            />
                            {fieldErrors.date && (
                                <p className="new-expense__error">{fieldErrors.date[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="new-expense__field">
                        <label htmlFor="new-expense-name" className="new-expense__label">За що</label>
                        <input
                            id="new-expense-name"
                            className="new-expense__input new-expense__input--name"
                            type="text"
                            maxLength={20}
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            disabled={isLoading}
                        />
                        {fieldErrors.name && (
                            <p className="new-expense__error">{fieldErrors.name[0]}</p>
                        )}
                    </div>

                    <div className="new-expense__field">
                        <label htmlFor="new-expense-description" className="new-expense__label">Опис</label>
                        <textarea
                            id="new-expense-description"
                            className="new-expense__input new-expense__input--textarea"
                            rows={2}
                            maxLength={200}
                            placeholder="Необов’язково"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            disabled={isLoading}
                        />
                        {fieldErrors.description && (
                            <p className="new-expense__error">{fieldErrors.description[0]}</p>
                        )}
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
                                        onChange={() => setCategory(cat)}
                                        disabled={isLoading}
                                    />
                                    {CATEGORY_LABELS[cat]}
                                </label>
                            ))}
                        </div>
                        {fieldErrors.category && (
                            <p className="new-expense__error">{fieldErrors.category[0]}</p>
                        )}
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
                            {fieldErrors.paidById && (
                                <p className="new-expense__error">{fieldErrors.paidById[0]}</p>
                            )}
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
                            {fieldErrors.splitBetween && (
                                <p className="new-expense__error">{fieldErrors.splitBetween[0]}</p>
                            )}
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
        </div>
    )
}
