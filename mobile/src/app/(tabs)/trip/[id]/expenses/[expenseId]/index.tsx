import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router, useLocalSearchParams} from 'expo-router';
import {useQuery} from '@tanstack/react-query';

import {colors} from '@/color';
import {getExpense, CATEGORY_LABELS} from '@/api/expense';
import {getTrip} from '@/api/trips';
import {formatMoney, formatTripDates} from '@/context/format';
import {getExpenseShares} from '@/utils/settle';
import {CATEGORY_COLORS, getAvatarColor} from '@/utils/colors';
import {useMe} from "@/hooks/queries";

export default function ExpenseDetailsScreen() {
    const {id: tripId, expenseId} = useLocalSearchParams<{ id: string; expenseId: string }>();
    const {data: me} = useMe()

    const {data: expense, isLoading, error} = useQuery({
        queryKey: ['expense', tripId, expenseId],
        queryFn: () => getExpense(tripId, expenseId),
        enabled: !!tripId && !!expenseId,
    });

    const {data: trip, isLoading: isTripLoading, error: tripError} = useQuery({
        queryKey: ['trip', tripId],
        queryFn: () => getTrip(tripId),
        enabled: !!tripId,
    });

    if (isLoading || isTripLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    if (error || tripError || !expense || !trip) {
        return (
            <View style={styles.center}>
                <Text style={styles.muted}>Не вдалося завантажити витрату</Text>
            </View>
        );
    }

    // ---- розрахунки: тут expense і trip уже точно є ----
    const memberName = (memberId: string) => {
        if (memberId === me?.id) return 'Ти';
        return trip.members.find((m) => m.id === memberId)?.name ?? 'Невідомий';
    };

    const payerId = expense.paidById ?? expense.addedById;
    const shares = getExpenseShares(expense, trip.members);
    const payerShare = shares.find((s) => s.id === payerId)?.amount ?? 0;
    const payerHasNoShare = shares.every((s) => s.id !== payerId);

    // платник першим, далі решта
    const orderedShares = [
        ...shares.filter((s) => s.id === payerId),
        ...shares.filter((s) => s.id !== payerId),
    ];

    const dates = formatTripDates(expense.date);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Pressable onPress={() => router.back()} hitSlop={10}>
                    <Text style={styles.back}>‹ Назад</Text>
                </Pressable>

                <Pressable onPress={() => router.push(`/trip/${tripId}/expenses/${expense.id}/editing`)} hitSlop={10}>
                    <Text style={styles.back}>Редагувати</Text>
                </Pressable>

                <View style={styles.header}>
                    <View style={styles.categoryRow}>
                        <View style={[styles.categoryDot, {backgroundColor: CATEGORY_COLORS[expense.category]}]}/>
                        <Text style={styles.muted}>
                            {CATEGORY_LABELS[expense.category]}{dates ? ` · ${dates}` : ''}
                        </Text>
                    </View>
                    <Text style={styles.title}>{expense.name}</Text>
                    <Text style={styles.amount}>{formatMoney(expense.amount)} ₴</Text>
                    <Text style={styles.title}>{expense.description}</Text>
                </View>

                <View style={styles.card}>
                    {payerHasNoShare ? (
                        <MemberRow
                            id={payerId}
                            name={memberName(payerId)}
                            note="оплата, без частки"
                            amount={`+${formatMoney(expense.amount)}`}
                            positive
                        />
                    ) : null}

                    {orderedShares.map((share) => {
                        const isPayer = share.id === payerId;

                        return (
                            <MemberRow
                                key={share.id}
                                id={share.id}
                                name={memberName(share.id)}
                                note={isPayer ? `оплата · частка ${formatMoney(share.amount)}` : 'частка'}
                                amount={
                                    isPayer
                                        ? `+${formatMoney(expense.amount - payerShare)}`
                                        : `−${formatMoney(share.amount)}`
                                }
                                positive={isPayer}
                            />
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

type MemberRowProps = {
    id: string;
    name: string;
    note: string;
    amount: string;
    positive?: boolean;
};

function MemberRow({id, name, note, amount, positive}: MemberRowProps) {
    return (
        <View style={styles.member}>
            <View style={[styles.avatar, {backgroundColor: getAvatarColor(id)}]}>
                <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            </View>

            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{name}</Text>
                <Text style={styles.memberNote}>{note}</Text>
            </View>

            <Text style={[styles.memberAmount, positive && styles.memberAmountPositive]}>
                {amount}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background},
    content: {padding: 20, gap: 20},
    back: {fontSize: 16, color: colors.text},

    header: {gap: 6},
    categoryRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
    categoryDot: {width: 10, height: 10, borderRadius: 5},
    title: {fontSize: 26, fontWeight: '600', color: colors.text, letterSpacing: -0.3},
    amount: {fontSize: 40, fontWeight: '700', color: colors.text, letterSpacing: -1},
    muted: {fontSize: 14, color: colors.muted},

    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        paddingHorizontal: 16,
    },
    member: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {color: '#FFFFFF', fontSize: 16, fontWeight: '600'},
    memberInfo: {flex: 1, gap: 2},
    memberName: {fontSize: 16, fontWeight: '500', color: colors.text},
    memberNote: {fontSize: 13, color: colors.muted},
    memberAmount: {fontSize: 16, fontWeight: '600', color: colors.text},
    memberAmountPositive: {color: colors.accent},
});