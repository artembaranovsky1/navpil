import './ExpenseDetail.scss'
import {useEffect, useState} from "react";
import {CategoryIcon} from "../../../../components/CategoryIcon/CategoryIcon.tsx";
import {CATEGORY_LABELS, deleteExpense, type ExpenseResponse} from "../../../../api/expense.ts";
import type {TripMember} from "../../../../api/trips.ts";
import {getExpenseShares, getMemberName} from "../../../../utils/settle.ts";
import {formatLongDate, formatMoney, pluralize} from "../../../../utils/format.ts";

type ExpenseDetailProps = {
    tripId: string;
    expense: ExpenseResponse;
    members: TripMember[];
    currentUserId?: string;
    onClose: () => void;
    onEdit: () => void;
    onDeleted: (expenseId: string) => void;
}

const formatTime = (date: string): string =>
    new Date(date).toLocaleTimeString('uk-UA', {hour: '2-digit', minute: '2-digit'});

export const ExpenseDetail = ({tripId, expense, members, currentUserId, onClose, onEdit, onDeleted}: ExpenseDetailProps) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const payerId = expense.paidById ?? expense.addedById;
    const shares = getExpenseShares(expense, members);
    const payerShare = shares.find((share) => share.id === payerId)?.amount ?? 0;
    // платник першим, далі решта
    const orderedShares = [
        ...shares.filter((share) => share.id === payerId),
        ...shares.filter((share) => share.id !== payerId),
    ];
    const isEqualSplit = shares.every((share) => share.amount === shares[0]?.amount);

    const name = (userId: string) => getMemberName(members, userId);
    const dateLabel = `${formatLongDate(expense.date ?? expense.createdAt)}, ${formatTime(expense.createdAt)}`;

    const avatarClass = (userId: string): string => {
        if (userId === payerId) return 'expense-detail__avatar expense-detail__avatar--payer';
        if (userId === currentUserId) return 'expense-detail__avatar expense-detail__avatar--me';
        return 'expense-detail__avatar';
    };

    const segmentClass = (userId: string): string => {
        if (userId === payerId) return 'expense-detail__segment expense-detail__segment--payer';
        if (userId === currentUserId) return 'expense-detail__segment expense-detail__segment--me';
        return 'expense-detail__segment';
    };

    const handleDelete = async () => {
        if (!isConfirmingDelete) {
            setIsConfirmingDelete(true);
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            await deleteExpense(tripId, expense.id);
            onDeleted(expense.id);
        } catch {
            setError('Не вдалося видалити витрату, спробуйте ще раз');
            setIsDeleting(false);
        }
    };

    return (
        <div className="expense-detail__backdrop" onClick={onClose}>
            <section
                role="dialog"
                aria-modal="true"
                aria-label="Деталі витрати"
                className="expense-detail"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="expense-detail__header">
                    <button type="button" className="expense-detail__close" aria-label="Закрити" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18"/>
                        </svg>
                    </button>
                    <button type="button" className="expense-detail__edit" onClick={onEdit}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>
                        </svg>
                        <span>Редагувати</span>
                    </button>
                </div>

                <div className="expense-detail__title-block">
                    <CategoryIcon category={expense.category} size="lg"/>
                    <div>
                        <h2 className="expense-detail__title">{expense.name}</h2>
                        <div className="expense-detail__meta">
                            {CATEGORY_LABELS[expense.category]} · {dateLabel}
                        </div>
                    </div>
                </div>

                <div className="expense-detail__amount">
                    {formatMoney(expense.amount)} <span className="expense-detail__currency">₴</span>
                </div>

                <section aria-label="Розподіл суми" className="expense-detail__split">
                    <div className="expense-detail__split-bar">
                        {orderedShares.map((share) => (
                            <span key={share.id} className={segmentClass(share.id)} style={{flexGrow: share.amount}}/>
                        ))}
                    </div>
                    <div className="expense-detail__split-note">
                        {isEqualSplit
                            ? `Порівну між ${shares.length} ${pluralize(shares.length, ['учасником', 'учасниками', 'учасниками'])} · по ${formatMoney(shares[0]?.amount ?? 0)} ₴`
                            : `Між ${shares.length} ${pluralize(shares.length, ['учасником', 'учасниками', 'учасниками'])}`}
                    </div>
                </section>

                <section className="expense-detail__members">
                    {shares.every((share) => share.id !== payerId) && (
                        <div className="expense-detail__member">
                            <span className={avatarClass(payerId)}>{name(payerId).charAt(0).toUpperCase()}</span>
                            <div className="expense-detail__member-info">
                                <div className="expense-detail__member-name">{name(payerId)}</div>
                                <div className="expense-detail__member-note">оплата, без частки</div>
                            </div>
                            <span className="expense-detail__member-amount expense-detail__member-amount--positive">
                                +{formatMoney(expense.amount)}
                            </span>
                        </div>
                    )}

                    {orderedShares.map((share) => {
                        const isPayer = share.id === payerId;

                        return (
                            <div key={share.id} className="expense-detail__member">
                                <span className={avatarClass(share.id)}>{name(share.id).charAt(0).toUpperCase()}</span>
                                <div className="expense-detail__member-info">
                                    <div className="expense-detail__member-name">{name(share.id)}</div>
                                    <div className="expense-detail__member-note">
                                        {isPayer ? `оплата · частка ${formatMoney(share.amount)}` : 'частка'}
                                    </div>
                                </div>
                                {isPayer ? (
                                    <span className="expense-detail__member-amount expense-detail__member-amount--positive">
                                        +{formatMoney(expense.amount - payerShare)}
                                    </span>
                                ) : (
                                    <span className="expense-detail__member-amount">−{formatMoney(share.amount)}</span>
                                )}
                            </div>
                        );
                    })}
                </section>

                {expense.description && (
                    <section aria-label="Опис" className="expense-detail__description">
                        <div className="expense-detail__description-label">Опис</div>
                        <p className="expense-detail__description-text">{expense.description}</p>
                    </section>
                )}

                <div className="expense-detail__spacer"/>

                <p className="expense-detail__added">
                    Додано: {name(expense.addedById)} · {formatLongDate(expense.createdAt)}, {formatTime(expense.createdAt)}
                </p>
                {error && <p className="expense-detail__error" role="alert">{error}</p>}
                <button
                    type="button"
                    className="expense-detail__delete"
                    onClick={handleDelete}
                    onBlur={() => setIsConfirmingDelete(false)}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Видаляю…' : isConfirmingDelete ? 'Натисніть ще раз, щоб видалити' : 'Видалити витрату'}
                </button>
            </section>
        </div>
    );
};
