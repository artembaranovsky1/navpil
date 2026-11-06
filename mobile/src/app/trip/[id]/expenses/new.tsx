import {router, useLocalSearchParams} from "expo-router";
import {toApiDate} from "@/api/helper";
import {useMe, useTrip} from "@/hooks/queries";
import {useCreateExpense} from "@/hooks/mutations";
import {ExpenseForm} from "@/components/expense-form";
import {ScreenState} from "@/components/ui/screen-state";

export default function NewExpenseScreen() {
    const {id: tripId} = useLocalSearchParams<{ id: string }>();
    const meQuery = useMe();
    const tripQuery = useTrip(tripId);
    const createExpense = useCreateExpense(tripId);

    if (tripQuery.isPending || meQuery.isPending) {
        return <ScreenState/>;
    }

    if (tripQuery.isError) {
        return <ScreenState error="Не вдалося завантажити подорож"/>;
    }

    const members = tripQuery.data.members;

    return (
        <ExpenseForm
            title="Нова витрата"
            members={members}
            initialValues={{
                price: '',
                date: toApiDate(new Date()),
                name: '',
                description: '',
                paidById: meQuery.data?.id ?? members[0]?.id,
                splitBetween: members.map((member) => member.id),
            }}
            isPending={createExpense.isPending}
            onSubmit={async (data) => {
                await createExpense.mutateAsync(data);
                router.back();
            }}
        />
    );
}
