import {useLocalSearchParams} from "expo-router";
import {useExpense, useTrip} from "@/hooks/queries";
import {useUpdateExpense} from "@/hooks/mutations";
import {ExpenseForm} from "@/components/expense-form";
import {ScreenState} from "@/components/ui/screen-state";

export default function EditingExpenseScreen() {
    const {id: tripId, expenseId} = useLocalSearchParams<{ id: string; expenseId: string }>();
    const tripQuery = useTrip(tripId);
    const expenseQuery = useExpense(tripId, expenseId);
    // після збереження useUpdateExpense сам повертає назад
    const updateExpense = useUpdateExpense(tripId, expenseId);

    if (tripQuery.isPending || expenseQuery.isPending) {
        return <ScreenState/>;
    }

    if (tripQuery.isError || expenseQuery.isError) {
        return <ScreenState error="Не вдалося завантажити витрату"/>;
    }

    const expense = expenseQuery.data;
    const members = tripQuery.data.members;

    return (
        <ExpenseForm
            title="Редагувати витрату"
            members={members}
            initialValues={{
                price: String(expense.amount),
                date: (expense.date ?? expense.createdAt).slice(0, 10),
                name: expense.name,
                description: expense.description ?? '',
                category: expense.category,
                paidById: expense.paidById ?? expense.addedById,
                // порожній список — ділимо між усіма
                splitBetween: expense.splitBetween.length > 0 ? expense.splitBetween : members.map((member) => member.id),
            }}
            isPending={updateExpense.isPending}
            onSubmit={(data) => updateExpense.mutateAsync(data)}
        />
    );
}
