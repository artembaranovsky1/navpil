import type {ExpenseCategory} from "../api/expense.ts";

export type FieldErrors = Record<string, string[]>;

// як у валідації на бекенді
export const EXPENSE_NAME_MIN = 3;
export const EXPENSE_NAME_MAX = 20;
export const EXPENSE_DESCRIPTION_MAX = 200;
const AMOUNT_MAX = 1_000_000;

// "1 740,5" -> 1740.5
export const parseAmount = (value: string): number => Number(value.replace(/\s/g, '').replace(',', '.'));

type ExpenseForm = {
    price: string;
    date: string;
    name: string;
    description: string;
    category?: ExpenseCategory;
    splitBetween: string[];
}

export const validateExpense = ({price, date, name, description, category, splitBetween}: ExpenseForm): FieldErrors => {
    const errors: FieldErrors = {};
    const amount = parseAmount(price);

    if (!price.trim() || Number.isNaN(amount)) {
        errors.amount = ['Вкажіть суму'];
    } else if (amount <= 0) {
        errors.amount = ['Сума має бути більшою за 0'];
    } else if (amount > AMOUNT_MAX) {
        errors.amount = ['Занадто велика сума'];
    } else if (!/^\d+(\.\d{1,2})?$/.test(String(amount))) {
        errors.amount = ['Не більше двох знаків після коми'];
    }

    if (!date) {
        errors.date = ['Вкажіть дату'];
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
        errors.name = ['Вкажіть, за що витрата'];
    } else if (trimmedName.length < EXPENSE_NAME_MIN) {
        errors.name = [`Назва — щонайменше ${EXPENSE_NAME_MIN} символи`];
    } else if (trimmedName.length > EXPENSE_NAME_MAX) {
        errors.name = [`Назва — до ${EXPENSE_NAME_MAX} символів`];
    }

    if (description.trim().length > EXPENSE_DESCRIPTION_MAX) {
        errors.description = [`Опис — до ${EXPENSE_DESCRIPTION_MAX} символів`];
    }

    if (!category) {
        errors.category = ['Оберіть категорію'];
    }

    if (splitBetween.length === 0) {
        errors.splitBetween = ['Оберіть хоча б одного учасника'];
    }

    return errors;
}
