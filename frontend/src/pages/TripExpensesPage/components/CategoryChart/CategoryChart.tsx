import './CategoryChart.scss'
import {CATEGORY_LABELS, type ExpenseCategory, type ExpenseResponse} from "../../../../api/expense.ts";
import {formatMoney} from "../../../../utils/format.ts";
import {CATEGORY_COLORS, CATEGORY_ORDER} from "../../../../utils/colors.ts";

type CategoryChartProps = {
    expenses: ExpenseResponse[];
    // мобільна картка: без заголовка, з кількістю категорій у кільці й лише сумами в легенді
    compact?: boolean;
}

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// невеликий проміжок між сегментами кільця
const GAP = 2;

export const CategoryChart = ({expenses, compact = false}: CategoryChartProps) => {
    const totals = new Map<ExpenseCategory, number>();
    expenses.forEach((expense) => {
        totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
    });

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // у кільці категорії йдуть у фіксованому порядку — так сусідні кольори завжди добре розрізняються
    const segments = CATEGORY_ORDER
        .filter((category) => (totals.get(category) ?? 0) > 0)
        .map((category) => ({category, amount: totals.get(category)!}));

    const categories = segments.map(({category, amount}, index) => ({
        category,
        amount,
        color: CATEGORY_COLORS[category],
        percent: Math.round((amount / total) * 100),
        length: (amount / total) * CIRCUMFERENCE,
        // сегмент починається там, де закінчились усі попередні
        offset: segments.slice(0, index).reduce((sum, prev) => sum + (prev.amount / total) * CIRCUMFERENCE, 0),
    }));

    // а в легенді — від найбільшої суми
    const legend = [...categories].sort((a, b) => b.amount - a.amount);

    const hasGap = categories.length > 1;

    return (
        <section
            aria-label={compact ? 'Витрати за категоріями' : 'Категорії'}
            className={compact ? 'category-chart category-chart--compact' : 'category-chart'}
        >
            {!compact && <h2 className="category-chart__title">Категорії</h2>}

            {categories.length === 0 ? (
                <p className="category-chart__empty">Ще немає витрат</p>
            ) : (
                <div className="category-chart__content">
                    <svg
                        width={compact ? 96 : 104}
                        height={compact ? 96 : 104}
                        viewBox="0 0 96 96"
                        role="img"
                        aria-label={categories.map((c) => `${CATEGORY_LABELS[c.category]} ${c.percent}%`).join(', ')}
                        className="category-chart__donut"
                    >
                        <g transform="rotate(-90 48 48)" fill="none" strokeWidth="12">
                            {categories.map((c) => {
                                const visible = hasGap ? Math.max(c.length - GAP, 0.5) : c.length;

                                return (
                                    <circle
                                        key={c.category}
                                        cx="48"
                                        cy="48"
                                        r={RADIUS}
                                        stroke={c.color}
                                        strokeDasharray={`${visible} ${CIRCUMFERENCE - visible}`}
                                        strokeDashoffset={-c.offset}
                                    />
                                );
                            })}
                        </g>
                        {compact && (
                            <text x="48" y="52" textAnchor="middle" className="category-chart__count">
                                {categories.length} кат.
                            </text>
                        )}
                    </svg>

                    <ul className="category-chart__legend">
                        {legend.map((c) => (
                            <li key={c.category} className="category-chart__item">
                                <span className="category-chart__dot" style={{background: c.color}}/>
                                <span className="category-chart__name">{CATEGORY_LABELS[c.category]}</span>
                                <span className="category-chart__amount">
                                    {compact ? formatMoney(c.amount) : `${formatMoney(c.amount)} · ${c.percent}%`}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
};
