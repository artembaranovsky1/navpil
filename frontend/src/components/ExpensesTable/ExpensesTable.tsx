import "./ExpensesTable.scss";
import {useState} from "react";
import {Link, useNavigate} from "react-router";
import type {ExpenseResponse} from "../../api/expense.ts";
import {CategoryIcon} from "../CategoryIcon/CategoryIcon.tsx";
import type {TripMember} from "../../api/trips.ts";
import {formatLongDate} from "../../utils/format.ts";

type ExpensesTableProps = {
    tripId: string;
    expenses: ExpenseResponse[];
    members: TripMember[];
    currentUserId?: string;
    // якщо передано — клік по витраті відкриває деталі на цій же сторінці
    onSelect?: (expense: ExpenseResponse) => void;
}

type Filter = 'all' | 'mine';

const MONTHS = ['січ', 'лют', 'бер', 'квіт', 'трав', 'черв', 'лип', 'серп', 'вер', 'жовт', 'лист', 'груд'];

const formatDate = (date: string): string => {
    const [, month, day] = date.slice(0, 10).split('-').map(Number);
    return `${day} ${MONTHS[month - 1]}`;
};

const formatAmount = (amount: number): string =>
    amount.toLocaleString('uk-UA', {maximumFractionDigits: 2});

const getMemberName = (members: TripMember[], userId: string): string =>
    members.find((m) => m.id === userId)?.name ?? 'Невідомий';

const getSplitLabel = (members: TripMember[], splitBetween: string[]): string => {
    if (splitBetween.length === 0 || splitBetween.length === members.length) {
        return 'усі';
    }

    return splitBetween.map((id) => getMemberName(members, id)).join(', ');
};

// "на трьох" — коли ділимо між усіма
const SPLIT_COUNT_LABELS = ['', 'на одного', 'на двох', 'на трьох', 'на чотирьох', 'на п’ятьох', 'на шістьох', 'на сімох', 'на вісьмох', 'на дев’ятьох', 'на десятьох'];

const getMobileSplitLabel = (members: TripMember[], splitBetween: string[]): string => {
    if (splitBetween.length === 0 || splitBetween.length === members.length) {
        return SPLIT_COUNT_LABELS[members.length] ?? 'на всіх';
    }

    return splitBetween.map((id) => getMemberName(members, id)).join(', ');
};

const toDateKey = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// "сьогодні", "вчора", "12 травня"
const formatRelativeDate = (date: string): string => {
    const day = date.slice(0, 10);
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

    if (day === toDateKey(today)) return 'сьогодні';
    if (day === toDateKey(yesterday)) return 'вчора';
    return formatLongDate(day);
};

export const ExpensesTable = ({tripId, expenses, members, currentUserId, onSelect}: ExpensesTableProps) => {
    const [search, setSearch] = useState<string>('');
    const [filter, setFilter] = useState<Filter>('all');
    const navigate = useNavigate();

    // клік по будь-якому місцю рядка відкриває деталі витрати
    const openExpense = (event: React.MouseEvent, expense: ExpenseResponse) => {
        if (onSelect) {
            onSelect(expense);
        } else if (!(event.target as HTMLElement).closest('a')) {
            // по посиланню з назвою перехід уже робить сам Link
            navigate(`/trips/${tripId}/expenses/${expense.id}`);
        }
    };

    const query = search.trim().toLowerCase();
    const visibleExpenses = expenses.filter((expense) =>
        (filter === 'all' || (expense.paidById ?? expense.addedById) === currentUserId)
        && expense.name.toLowerCase().includes(query)
    );

    return (
        <section className="expenses-table" aria-label="Витрати">
            <div className="expenses-table__header">
                <h2 className="expenses-table__title">Витрати · {expenses.length}</h2>
                <div className="expenses-table__controls">
                    <label htmlFor="expenses-search" className="expenses-table__visually-hidden">Пошук витрат</label>
                    <input
                        id="expenses-search"
                        className="expenses-table__search"
                        type="search"
                        placeholder="Пошук"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <span className="expenses-table__segmented">
                        <button
                            type="button"
                            className={filter === 'all' ? 'expenses-table__segment expenses-table__segment--active' : 'expenses-table__segment'}
                            onClick={() => setFilter('all')}
                        >
                            Усі
                        </button>
                        <button
                            type="button"
                            className={filter === 'mine' ? 'expenses-table__segment expenses-table__segment--active' : 'expenses-table__segment'}
                            onClick={() => setFilter('mine')}
                        >
                            Мої
                        </button>
                    </span>
                </div>
            </div>

            {/* на мобільному замість таблиці — список */}
            <ul className="expenses-table__list">
                {visibleExpenses.map((expense) => {
                    const payerId = expense.paidById ?? expense.addedById;
                    const meta = [
                        getMemberName(members, payerId),
                        getMobileSplitLabel(members, expense.splitBetween),
                        formatRelativeDate(expense.date ?? expense.createdAt),
                    ].join(' · ');

                    const content = (
                        <>
                            <CategoryIcon category={expense.category} size="list"/>
                            <span className="expenses-table__list-text">
                                <span className="expenses-table__list-name">{expense.name}</span>
                                <span className="expenses-table__list-meta">{meta}</span>
                            </span>
                            <span className="expenses-table__list-amount">{formatAmount(expense.amount)}</span>
                        </>
                    );

                    return (
                        <li key={expense.id} className="expenses-table__list-item">
                            {onSelect ? (
                                <button type="button" className="expenses-table__list-row" onClick={() => onSelect(expense)}>
                                    {content}
                                </button>
                            ) : (
                                <Link to={`/trips/${tripId}/expenses/${expense.id}`} className="expenses-table__list-row">
                                    {content}
                                </Link>
                            )}
                        </li>
                    );
                })}
                {visibleExpenses.length === 0 && (
                    <li className="expenses-table__list-empty">
                        {expenses.length === 0 ? 'Витрат поки немає' : 'Нічого не знайдено'}
                    </li>
                )}
            </ul>

            <div className="expenses-table__scroll">
                <table className="expenses-table__table">
                    <thead>
                        <tr>
                            <th>Витрата</th>
                            <th>Хто платив</th>
                            <th>Ділимо між</th>
                            <th>Дата</th>
                            <th className="expenses-table__amount">Сума, ₴</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleExpenses.map((expense) => (
                            <tr
                                key={expense.id}
                                className="expenses-table__row"
                                onClick={(event) => openExpense(event, expense)}
                            >
                                <td>
                                    {onSelect ? (
                                        <button
                                            type="button"
                                            className="expenses-table__name expenses-table__name--button"
                                        >
                                            <CategoryIcon category={expense.category}/>
                                            <span>{expense.name}</span>
                                        </button>
                                    ) : (
                                        <Link to={`/trips/${tripId}/expenses/${expense.id}`} className="expenses-table__name">
                                            <CategoryIcon category={expense.category}/>
                                            <span>{expense.name}</span>
                                        </Link>
                                    )}
                                </td>
                                <td>{getMemberName(members, expense.paidById ?? expense.addedById)}</td>
                                <td className="expenses-table__muted">{getSplitLabel(members, expense.splitBetween)}</td>
                                <td className="expenses-table__muted">{formatDate(expense.date ?? expense.createdAt)}</td>
                                <td className="expenses-table__amount expenses-table__strong">{formatAmount(expense.amount)}</td>
                            </tr>
                        ))}
                        {visibleExpenses.length === 0 && (
                            <tr>
                                <td colSpan={5} className="expenses-table__empty">
                                    {expenses.length === 0 ? 'Витрат поки немає' : 'Нічого не знайдено'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
