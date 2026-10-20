import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {router, useLocalSearchParams} from "expo-router";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getTrip, TripMember, TripResponse} from "@/api/trips";
import {ApiError} from "@/api/ApiError";
import {ExpenseResponse, getExpenses} from "@/api/expense";
import {useEffect, useState} from "react";
import {useAuth} from "@/context/auth";
import {colors} from "@/color";
import {SafeAreaView} from "react-native-safe-area-context";
import {calculateSettlement, getMemberName, Transfer} from "@/utils/settle";
import {formatMoney, formatSignedMoney, formatTripDates} from "@/context/format";
import { createPayment, getPayments, PaymentResponse } from '@/api/payments';
import { DimensionValue } from 'react-native';
import {useMe} from "@/hooks/queries";

type SettlementProps = {
    trip: TripResponse;
    expenses: ExpenseResponse[];
    payments: PaymentResponse[];
    currentUserId?: string;
}

const transferKey = (transfer: Transfer): string => `${transfer.fromId}->${transfer.toId}`;

export default function SettleScreen() {
    const {signOut} = useAuth();
    const { id: tripId } = useLocalSearchParams<{ id: string }>();
    const { data: me } = useMe();

    const {data: trip, isLoading, error} = useQuery({
        queryKey: ['trip', tripId],
        queryFn: () => getTrip(tripId),
        enabled: !!tripId,
        retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 2,
    })

    const {data: expenses = [], isLoading: isExpensesLoading, error: expensesError} = useQuery({
        queryKey: ['expenses', tripId],
        queryFn: () => getExpenses(tripId),
        enabled: !!tripId,
        retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 2,
    })

    const {data: payments = [], isLoading: isPaymentsLoading, error: paymentsError} = useQuery({
        queryKey: ['payments', tripId],
        queryFn: () => getPayments(tripId),
        enabled: !!tripId,
        retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 2,
    })

    useEffect(() => {
        const err = error ?? expensesError ?? paymentsError;
        if (err instanceof ApiError && err.status === 401) {   // err, а не error
            signOut();
        }
    }, [error, expensesError, paymentsError]);

    if (isLoading || isExpensesLoading || isPaymentsLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
            </View>
        );
    }

    if (error || expensesError || paymentsError || !trip) {
        return (
            <View style={styles.center}>
                <Text style={styles.muted}>Не вдалося завантажити подорож</Text>
            </View>
        );
    }

    const dates = formatTripDates(trip?.startDate, trip?.endDate);



    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                <TripHeader trip={trip} dates={dates} active="settle" />
                <Settlement trip={trip} expenses={expenses} payments={payments} currentUserId={me?.id} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ================= ШАПКА =================

type TripHeaderProps = {
    trip: TripResponse;
    dates: string | null;
    active: 'expenses' | 'settle' | 'members';
};

function TripHeader({ trip, dates, active }: TripHeaderProps) {
    const tabs = [
        { key: 'expenses', label: 'Витрати', href: `/trip/${trip.id}` },
        { key: 'settle', label: 'Розрахунок', href: `/trip/${trip.id}/settle` },
        { key: 'members', label: `Учасники · ${trip.members.length}`, href: `/trip/${trip.id}/members` },
    ] as const;

    return (
        <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
                <Text style={styles.breadcrumbs}>
                    ‹ Мої подорожі{dates ? ` · ${dates}` : ''}
                    {/* {STATUS_LABELS[trip.status]} — додайте, якщо є мапа статусів */}
                </Text>
            </Pressable>

            <Text style={styles.title}>{trip.name}</Text>

            <Pressable
                onPress={() => router.push(`/trip/${trip.id}/expenses/new`)}
                style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.85 }]}
            >
                {/*<PlusIcon size={16} />*/}
                <Text style={styles.addButtonText}>Додати витрату</Text>
            </Pressable>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                {tabs.map((tab) => {
                    const isActive = tab.key === active;
                    return (
                        <Pressable
                            key={tab.key}
                            onPress={() => !isActive && router.replace(tab.href)}
                            style={[styles.tab, isActive && styles.tabActive]}
                        >
                            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}

// ================= РОЗРАХУНОК =================


function Settlement({trip, expenses, payments, currentUserId}: SettlementProps) {
    const queryClient = useQueryClient();

    const [payingKey, setPayingKey] = useState<string>();
    const [actionError, setActionError] = useState<string>('');

    const { balances, remaining, transfers, naiveTransfersCount } = calculateSettlement(trip.members, expenses, payments);
    const name = (userId: string) => getMemberName(trip.members, userId);

    const myRemaining = currentUserId ? remaining[currentUserId] ?? 0 : 0;
    const maxBalance = Math.max(...balances.map((b) => Math.abs(b.balance)), 0);
    const totals = balances.reduce(
        (sum, b) => ({paid: sum.paid + b.paid, share: sum.share + b.share}),
        {paid: 0, share: 0},
    );
    const totalTransfers = payments.length + transfers.length;
    const showsSavings = naiveTransfersCount > transfers.length;

    const progress: DimensionValue = totalTransfers > 0
        ? `${(payments.length / totalTransfers) * 100}%`
        : '0%';

    const handlePaid = async (transfer: Transfer) => {
        setPayingKey(transferKey(transfer));
        setActionError('');

        try {
            await createPayment(trip.id, transfer);
            queryClient.invalidateQueries({ queryKey: ['payments', trip.id] });
        } catch {
            setActionError('Не вдалося позначити переказ, спробуйте ще раз');
        } finally {
            setPayingKey(undefined);
        }
    };

    return (
        <View style={styles.settlement}>
            {/* ---- Підсумки ---- */}
            <View style={styles.statsRow}>
                <View style={[styles.card, styles.statCardWide]}>
                    <Text style={styles.cardLabel}>
                        {myRemaining > 0 ? 'Тобі винні' : myRemaining < 0 ? 'Тобі треба віддати' : 'Ти в розрахунку'}
                    </Text>
                    <Text style={[styles.stat, myRemaining > 0 && styles.positive]}>
                        {formatSignedMoney(myRemaining)} ₴
                    </Text>
                </View>

                <View style={[styles.card, styles.statCard]}>
                    <Text style={styles.cardLabel}>Переказів</Text>
                    <Text style={styles.statLight}>
                        {transfers.length}
                        {showsSavings ? <Text style={styles.statNote}> замість {naiveTransfersCount}</Text> : null}
                    </Text>
                </View>

                <View style={[styles.card, styles.statCard]}>
                    <Text style={styles.cardLabel}>Оплачено</Text>
                    <Text style={styles.statLight}>{payments.length} з {totalTransfers}</Text>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: progress }]} />
                    </View>
                </View>
            </View>

            {/* ---- Перекази ---- */}
            <View style={styles.card}>
                <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>Перекази</Text>
                    <Text style={styles.muted}>
                        {transfers.length > 0 ? `${transfers.length} з ${totalTransfers} очікують` : 'усі розрахувалися'}
                    </Text>
                </View>

                {transfers.length > 0 ? (
                    transfers.map((transfer) => {
                        const key = transferKey(transfer);
                        return (
                            <View key={key} style={styles.transfer}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.transferWho}>
                                        {name(transfer.fromId)} → {name(transfer.toId)}
                                    </Text>
                                    <Text style={styles.transferAmount}>{formatMoney(transfer.amount)} ₴</Text>
                                </View>
                                <Pressable
                                    onPress={() => handlePaid(transfer)}
                                    disabled={payingKey !== undefined}
                                    style={({ pressed }) => [
                                        styles.paidButton,
                                        (pressed || payingKey !== undefined) && { opacity: 0.6 },
                                    ]}
                                >
                                    <Text style={styles.paidButtonText}>
                                        {payingKey === key ? 'Зберігаю…' : 'Оплачено'}
                                    </Text>
                                </Pressable>
                            </View>
                        );
                    })
                ) : (
                    <Text style={styles.muted}>Ніхто нікому нічого не винен.</Text>
                )}

                {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
            </View>

            {/* ---- Баланси (смужки) ---- */}
            <View style={styles.card}>
                <Text style={styles.panelTitle}>Баланси</Text>
                <View style={styles.axis}>
                    <Text style={styles.axisText}>винні</Text>
                    <Text style={styles.axisText}>отримують</Text>
                </View>

                {balances.map((b) => {
                    const width: DimensionValue = maxBalance > 0
                        ? `${(Math.abs(b.balance) / maxBalance) * 100}%`
                        : '0%';

                    return (
                        <View key={b.id} style={styles.barRow}>
                            <Text style={styles.barName} numberOfLines={1}>{name(b.id)}</Text>

                            <View style={styles.barTrack}>
                                <View style={[styles.barHalf, styles.barHalfNegative]}>
                                    {b.balance < 0 ? <View style={[styles.bar, styles.barNegative, { width }]} /> : null}
                                </View>
                                <View style={styles.barHalf}>
                                    {b.balance > 0 ? <View style={[styles.bar, styles.barPositive, { width }]} /> : null}
                                </View>
                            </View>

                            <Text style={[styles.barValue, b.balance > 0 && styles.positive]}>
                                {formatSignedMoney(b.balance)}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* ---- Детально (замість таблиці) ---- */}
            <View style={styles.card}>
                <Text style={styles.panelTitle}>Детально</Text>

                <View style={[styles.tableRow, styles.tableHead]}>
                    <Text style={[styles.cellName, styles.headText]}>Учасник</Text>
                    <Text style={[styles.cell, styles.headText]}>Заплатив</Text>
                    <Text style={[styles.cell, styles.headText]}>Частка</Text>
                    <Text style={[styles.cell, styles.headText]}>Баланс</Text>
                </View>

                {balances.map((b) => (
                    <View key={b.id} style={styles.tableRow}>
                        <Text style={styles.cellName} numberOfLines={1}>
                            {name(b.id)}
                            {b.id === currentUserId ? <Text style={styles.muted}> · ти</Text> : null}
                        </Text>
                        <Text style={styles.cell}>{formatMoney(b.paid)}</Text>
                        <Text style={[styles.cell, styles.mutedCell]}>{formatMoney(b.share)}</Text>
                        <Text style={[styles.cell, styles.strong, b.balance > 0 && styles.positive]}>
                            {formatSignedMoney(b.balance)}
                        </Text>
                    </View>
                ))}

                <View style={[styles.tableRow, styles.tableTotal]}>
                    <Text style={[styles.cellName, styles.strong]}>Разом</Text>
                    <Text style={[styles.cell, styles.strong]}>{formatMoney(totals.paid)}</Text>
                    <Text style={[styles.cell, styles.strong]}>{formatMoney(totals.share)}</Text>
                    <Text style={[styles.cell, styles.strong]}>0</Text>
                </View>
            </View>
        </View>
    );
}

// ================= СТИЛІ =================

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    content: { padding: 20, gap: 20 },
    muted: { fontSize: 13, color: colors.muted },
    error: { color: colors.error, fontSize: 14, marginTop: 8 },
    positive: { color: colors.accent },
    strong: { fontWeight: '600' },

    // шапка
    header: { gap: 12 },
    breadcrumbs: { fontSize: 14, color: colors.muted },
    title: { fontSize: 30, fontWeight: '600', color: colors.text, letterSpacing: -0.5 },
    addButton: {
        height: 48, borderRadius: 24, backgroundColor: colors.text,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    addButtonText: { color: colors.surface, fontSize: 15, fontWeight: '500' },
    tabs: { gap: 8 },
    tab: {
        height: 36, paddingHorizontal: 14, borderRadius: 18,
        borderWidth: 1, borderColor: colors.border, justifyContent: 'center',
    },
    tabActive: { backgroundColor: colors.text, borderColor: colors.text },
    tabText: { fontSize: 14, color: colors.text },
    tabTextActive: { color: colors.surface },

    // загальні картки
    settlement: { gap: 16 },
    card: {
        backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
        borderRadius: 18, padding: 16, gap: 10,
    },
    cardLabel: { fontSize: 13, color: colors.muted },
    panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    panelTitle: { fontSize: 18, fontWeight: '600', color: colors.text },

    // підсумки
    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statCardWide: { width: '100%' },
    statCard: { flex: 1, minWidth: 140 },
    stat: { fontSize: 28, fontWeight: '700', color: colors.text },
    statLight: { fontSize: 22, fontWeight: '500', color: colors.text },
    statNote: { fontSize: 13, fontWeight: '400', color: colors.muted },
    progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.accent },

    // перекази
    transfer: {
        flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    },
    transferWho: { fontSize: 15, color: colors.text },
    transferAmount: { fontSize: 17, fontWeight: '600', color: colors.text, marginTop: 2 },
    paidButton: {
        height: 36, paddingHorizontal: 14, borderRadius: 18,
        borderWidth: 1, borderColor: colors.text, justifyContent: 'center',
    },
    paidButtonText: { fontSize: 14, fontWeight: '500', color: colors.text },

    // баланси
    axis: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 80 },
    axisText: { fontSize: 12, color: colors.muted },
    barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    barName: { width: 72, fontSize: 14, color: colors.text },
    barTrack: { flex: 1, flexDirection: 'row', height: 14 },
    barHalf: { flex: 1, justifyContent: 'center' },
    barHalfNegative: {
        alignItems: 'flex-end',   // червона смужка росте від центру вліво
        borderRightWidth: 1, borderRightColor: colors.border,
    },
    bar: { height: 10, borderRadius: 5 },
    barNegative: { backgroundColor: colors.error },
    barPositive: { backgroundColor: colors.accent },
    barValue: { width: 72, textAlign: 'right', fontSize: 14, color: colors.text },

    // таблиця
    tableRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
    },
    tableHead: { borderTopWidth: 0, paddingVertical: 6 },
    tableTotal: { borderTopWidth: 1, borderTopColor: colors.text },
    headText: { fontSize: 12, color: colors.muted },
    cellName: { flex: 1.4, fontSize: 14, color: colors.text },
    cell: { flex: 1, fontSize: 14, color: colors.text, textAlign: 'right' },
    mutedCell: { color: colors.muted },
});
