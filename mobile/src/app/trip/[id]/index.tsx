import {Pressable, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {router, useLocalSearchParams} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {colors, fonts} from "@/color";
import {formatLongDate} from "@/context/format";
import {useExpenses, useMe, usePayments, useTrip} from "@/hooks/queries";
import {ExpenseResponse} from "@/api/expense";
import {TripMember} from "@/api/trips";
import {getMemberName} from "@/utils/settle";
import {AddExpenseFab, TripHeader, TripTopbar} from "@/components/trip-header";
import {CategoryChart} from "@/components/category-chart";
import {CategoryIcon} from "@/components/ui/category-icon";
import {ScreenState} from "@/components/ui/screen-state";

// "на трьох" — коли ділимо між усіма
const SPLIT_COUNT_LABELS = ['', 'на одного', 'на двох', 'на трьох', 'на чотирьох', 'на п’ятьох', 'на шістьох', 'на сімох', 'на вісьмох', 'на дев’ятьох', 'на десятьох'];

const getSplitLabel = (members: TripMember[], splitBetween: string[]): string => {
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

const formatAmount = (amount: number): string =>
    amount.toLocaleString('uk-UA', {maximumFractionDigits: 2});

export default function TripScreen() {
    const {id: tripId} = useLocalSearchParams<{ id: string }>();
    const meQuery = useMe();
    const tripQuery = useTrip(tripId);
    const expensesQuery = useExpenses(tripId);
    const paymentsQuery = usePayments(tripId);

    if (tripQuery.isPending || expensesQuery.isPending || paymentsQuery.isPending) {
        return <ScreenState/>;
    }

    if (tripQuery.isError || expensesQuery.isError || paymentsQuery.isError) {
        return <ScreenState error="Не вдалося завантажити витрати"/>;
    }

    const trip = tripQuery.data;
    const expenses = expensesQuery.data;
    const currentUserId = meQuery.data?.id;

    const refresh = () => {
        tripQuery.refetch();
        expensesQuery.refetch();
        paymentsQuery.refetch();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <TripTopbar trip={trip} currentUserId={currentUserId}/>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={expensesQuery.isRefetching} onRefresh={refresh}/>}
            >
                <TripHeader
                    trip={trip}
                    expenses={expenses}
                    payments={paymentsQuery.data}
                    currentUserId={currentUserId}
                    active="expenses"
                    summary={<CategoryChart expenses={expenses}/>}
                />

                <View>
                    {expenses.map((expense, index) => (
                        <ExpenseRow
                            key={expense.id}
                            expense={expense}
                            members={trip.members}
                            isLast={index === expenses.length - 1}
                            onPress={() => router.push(`/trip/${tripId}/expenses/${expense.id}`)}
                        />
                    ))}
                    {expenses.length === 0 && <Text style={styles.empty}>Витрат поки немає</Text>}
                </View>
            </ScrollView>

            <AddExpenseFab tripId={tripId}/>
        </SafeAreaView>
    )
}

type ExpenseRowProps = {
    expense: ExpenseResponse;
    members: TripMember[];
    isLast: boolean;
    onPress: () => void;
}

function ExpenseRow({expense, members, isLast, onPress}: ExpenseRowProps) {
    const payerId = expense.paidById ?? expense.addedById;
    const meta = [
        getMemberName(members, payerId),
        getSplitLabel(members, expense.splitBetween),
        formatRelativeDate(expense.date ?? expense.createdAt),
    ].join(' · ');

    return (
        <Pressable
            onPress={onPress}
            style={({pressed}) => [styles.row, !isLast && styles.rowDivider, pressed && {opacity: 0.6}]}
        >
            <CategoryIcon category={expense.category} size="list"/>
            <View style={styles.rowText}>
                <Text style={styles.rowName} numberOfLines={1}>{expense.name}</Text>
                <Text style={styles.rowMeta} numberOfLines={1}>{meta}</Text>
            </View>
            <Text style={styles.rowAmount}>{formatAmount(expense.amount)}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    // місце під кнопку «+» внизу
    content: {paddingHorizontal: 24, paddingTop: 24, paddingBottom: 112, gap: 24},

    row: {paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 14},
    rowDivider: {borderBottomWidth: 1, borderBottomColor: colors.rowDivider},
    rowText: {flex: 1, minWidth: 0},
    rowName: {fontSize: 15, color: colors.text, fontFamily: fonts.medium},
    rowMeta: {marginTop: 2, fontSize: 12, color: colors.muted, fontFamily: fonts.regular},
    rowAmount: {fontSize: 15, color: colors.text, fontFamily: fonts.medium},
    empty: {paddingVertical: 24, textAlign: 'center', fontSize: 14, color: colors.muted, fontFamily: fonts.regular},
});
