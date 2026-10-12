import './DailyChart.scss'
import type {ExpenseResponse} from "../../../../api/expense.ts";
import type {TripResponse} from "../../../../api/trips.ts";
import {formatLongDate, formatMoney, formatShortDate, todayIso} from "../../../../utils/format.ts";

type DailyChartProps = {
    trip: TripResponse;
    expenses: ExpenseResponse[];
}

const BAR_MAX_HEIGHT = 96;
const DAY_MS = 24 * 60 * 60 * 1000;

const getExpenseDay = (expense: ExpenseResponse): string => (expense.date ?? expense.createdAt).slice(0, 10);

const addDays = (date: string, days: number): string =>
    new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);

// Дні подорожі; якщо витрати виходять за межі дат — розширюємо діапазон
const getDays = (trip: TripResponse, expenseDays: string[]): string[] => {
    const candidatesStart = [trip.startDate?.slice(0, 10), ...expenseDays].filter(Boolean) as string[];
    const candidatesEnd = [trip.endDate?.slice(0, 10), ...expenseDays].filter(Boolean) as string[];

    if (candidatesStart.length === 0) return [];

    const start = candidatesStart.sort()[0];
    const end = candidatesEnd.sort()[candidatesEnd.length - 1] ?? start;

    const days: string[] = [];
    for (let day = start; day <= end; day = addDays(day, 1)) {
        days.push(day);
    }

    return days;
};

export const DailyChart = ({trip, expenses}: DailyChartProps) => {
    const totals: Record<string, number> = {};
    expenses.forEach((expense) => {
        const day = getExpenseDay(expense);
        totals[day] = (totals[day] ?? 0) + expense.amount;
    });

    const days = getDays(trip, Object.keys(totals));
    const today = todayIso();

    const maxDay = days.reduce<string | undefined>(
        (best, day) => (totals[day] ?? 0) > (best ? totals[best] ?? 0 : 0) ? day : best,
        undefined,
    );
    const maxAmount = maxDay ? totals[maxDay] : 0;

    return (
        <section aria-label="Витрати по днях" className="daily-chart">
            <div className="daily-chart__header">
                <h2 className="daily-chart__title">По днях</h2>
                {maxDay && (
                    <span className="daily-chart__note">
                        максимум {formatMoney(maxAmount)} ₴ · {formatLongDate(maxDay)}
                    </span>
                )}
            </div>

            {days.length === 0 ? (
                <p className="daily-chart__empty">Ще немає витрат</p>
            ) : (
                <div className="daily-chart__scroll">
                    <div className="daily-chart__bars" style={{gridTemplateColumns: `repeat(${days.length}, minmax(40px, 1fr))`}}>
                        {days.map((day) => {
                            const amount = totals[day] ?? 0;
                            const isFuture = day > today;
                            const isToday = day === today;
                            const height = amount > 0 ? Math.max((amount / maxAmount) * BAR_MAX_HEIGHT, 4) : 4;

                            const barClass = [
                                'daily-chart__bar',
                                amount === 0 && (isFuture ? 'daily-chart__bar--future' : 'daily-chart__bar--empty'),
                                amount > 0 && isToday && 'daily-chart__bar--today',
                            ].filter(Boolean).join(' ');

                            return (
                                <div key={day} className="daily-chart__day">
                                    <span className={amount > 0 ? 'daily-chart__value daily-chart__value--filled' : 'daily-chart__value'}>
                                        {amount > 0 ? formatMoney(amount) : isFuture ? '—' : '0'}
                                    </span>
                                    <div className={barClass} style={{height}}/>
                                    <span className={isToday ? 'daily-chart__date daily-chart__date--today' : 'daily-chart__date'}>
                                        {formatShortDate(day)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};
