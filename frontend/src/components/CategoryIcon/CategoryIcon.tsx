import "./CategoryIcon.scss";
import type {ExpenseCategory} from "../../api/expense.ts";

type CategoryIconProps = {
    category: ExpenseCategory;
    size?: 'md' | 'lg';
}

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
    food: 'M4 3v8a3 3 0 0 0 6 0V3M7 3v18M17 3c-2 0-3 3-3 7h3v11',
    transport: 'M5 17V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14H5zM15 9h2l2 2v6a1.5 1.5 0 0 1-3 0v-3h-1M8 9h4',
    housing: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
    shopping: 'M3 5h2l2 11h11l2-8H6M9 20h.01M17 20h.01',
    entertainment: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z',
    other: 'M5 12h.01M12 12h.01M19 12h.01',
};

const ICON_SIZES = {md: 16, lg: 24};

export const CategoryIcon = ({category, size = 'md'}: CategoryIconProps) => (
    <span className={`category-icon category-icon--${size} category-icon--${category}`}>
        <svg width={ICON_SIZES[size]} height={ICON_SIZES[size]} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
             strokeLinejoin="round" aria-hidden="true">
            <path d={CATEGORY_ICONS[category] ?? CATEGORY_ICONS.other}/>
        </svg>
    </span>
);
