import {useState} from "react";
import {DimensionValue, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useLocalSearchParams} from "expo-router";
import {useQueryClient} from "@tanstack/react-query";
import {SafeAreaView} from "react-native-safe-area-context";
import {TripResponse} from "@/api/trips";
import {ExpenseResponse} from "@/api/expense";
import {createPayment, PaymentResponse} from '@/api/payments';
import {colors, fonts} from "@/color";
import {calculateSettlement, getMemberName, Transfer} from "@/utils/settle";
import {formatMoney, formatSignedMoney} from "@/context/format";
import {useExpenses, useMe, usePayments, useTrip} from "@/hooks/queries";
import {AddExpenseFab, TripHeader, TripTopbar} from "@/components/trip-header";
import {ScreenState} from "@/components/ui/screen-state";

type SettlementProps = {
    trip: TripResponse;
    expenses: ExpenseResponse[];
    payments: PaymentResponse[];
    currentUserId?: string;
}

const transferKey = (transfer: Transfer): string => `${transfer.fromId}->${transfer.toId}`;

export default function SettleScreen() {
    const {id: tripId} = useLocalSearchParams<{ id: string }>();
    const {data: me} = useMe();
    const tripQuery = useTrip(tripId);
    const expensesQuery = useExpenses(tripId);
    const paymentsQuery = usePayments(tripId);

    if (tripQuery.isPending || expensesQuery.isPending || paymentsQuery.isPending) {
        return <ScreenState/>;
    }

    if (tripQuery.isError || expensesQuery.isError || paymentsQuery.isError) {
        return <ScreenState error="Не вдалося завантажити розрахунок"/>;
    }

    const trip = tripQuery.data;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <TripTopbar trip={trip} currentUserId={me?.id}/>

            <ScrollView contentContainerStyle={styles.content}>
                <TripHeader
                    trip={trip}
                    expenses={expensesQuery.data}
                    payments={paymentsQuery.data}
                    currentUserId={me?.id}
                    active="settle"
                />
                <Settlement
                    trip={trip}
                    expenses={expensesQuery.data}
                    payments={paymentsQuery.data}
                    currentUserId={me?.id}
                />
            </ScrollView>

            <AddExpenseFab tripId={tripId}/>
        </SafeAreaView>
    );
}

function Settlement({trip, expenses, payments, currentUserId}: SettlementProps) {
    const queryClient = useQueryClient();

    const [payingKey, setPayingKey] = useState<string>();
    const [actionError, setActionError] = useState<string>('');

    const {balances, remaining, transfers, naiveTransfersCount} = calculateSettlement(trip.members, expenses, payments);
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
            queryClient.invalidateQueries({queryKey: ['payments', trip.id]});
            // баланси в списку подорожей теж змінились
            queryClient.invalidateQueries({queryKey: ['trips']});
        } catch {
            setActionError('Не вдалося позначити переказ, спробуйте ще раз');
        } finally {
            setPayingKey(undefined);
        }
    };

    return (
        <View style={styles.settlement}>
            <View style={styles.card}>
                <Text style={styles.label}>
                    {myRemaining > 0 ? 'Тобі винні' : myRemaining < 0 ? 'Тобі треба віддати' : 'Ти в розрахунку'}
                </Text>
                <Text style={[styles.stat, styles.statStrong, myRemaining > 0 && styles.positive]}>
                    {formatSignedMoney(myRemaining)} ₴
                </Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.label}>Переказів, щоб розрахуватися</Text>
                <Text style={styles.stat}>
                    {transfers.length}
                    {showsSavings && <Text style={styles.statNote}> замість {naiveTransfersCount}</Text>}
                </Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.label}>Оплачено</Text>
                <Text style={styles.stat}>{payments.length} з {totalTransfers}</Text>
                <View style={styles.progress}>
                    <View style={[styles.progressFill, {width: progress}]}/>
                </View>
            </View>

            <View style={styles.panel}>
                <Text style={styles.panelTitle}>Баланси</Text>
                <View style={styles.axis}>
                    <Text style={styles.axisText}>винні</Text>
                    <Text style={styles.axisText}>отримують</Text>
                </View>
                <View style={styles.bars}>
                    {balances.map((b) => {
                        const width: DimensionValue = maxBalance > 0 ? `${(Math.abs(b.balance) / maxBalance) * 100}%` : 0;

                        return (
                            <View key={b.id} style={styles.barRow}>
                                <Text style={styles.barName} numberOfLines={1}>{name(b.id)}</Text>
                                <View style={styles.barTrack}>
                                    <View style={[styles.barHalf, styles.barHalfNegative]}>
                                        {b.balance < 0 && <View style={[styles.bar, styles.barNegative, {width}]}/>}
                                    </View>
                                    <View style={styles.barHalf}>
                                        {b.balance > 0 && <View style={[styles.bar, styles.barPositive, {width}]}/>}
                                    </View>
                                </View>
                                <Text style={[styles.barValue, b.balance > 0 && styles.positive]}>
                                    {formatSignedMoney(b.balance)}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            <View style={[styles.panel, styles.panelTable]}>
                <Text style={[styles.panelTitle, styles.tableTitle]}>Детально</Text>
                <View style={[styles.tableRow, styles.tableHead]}>
                    <Text style={[styles.th, styles.cellName]}>Учасник</Text>
                    <Text style={styles.th}>Заплатив</Text>
                    <Text style={styles.th}>Частка</Text>
                    <Text style={styles.th}>Баланс</Text>
                </View>
                {balances.map((b) => (
                    <View key={b.id} style={[styles.tableRow, styles.tableRowDivider]}>
                        <Text style={[styles.td, styles.cellName]} numberOfLines={1}>
                            {name(b.id)}
                            {b.id === currentUserId && <Text style={styles.muted}> · ти</Text>}
                        </Text>
                        <Text style={styles.td}>{formatMoney(b.paid)}</Text>
                        <Text style={[styles.td, styles.tdMuted]}>{formatMoney(b.share)}</Text>
                        <Text style={[styles.td, styles.tdStrong, b.balance > 0 && styles.positive]}>
                            {formatSignedMoney(b.balance)}
                        </Text>
                    </View>
                ))}
                <View style={styles.tableRow}>
                    <Text style={[styles.td, styles.tdTotal, styles.cellName]}>Разом</Text>
                    <Text style={[styles.td, styles.tdTotal]}>{formatMoney(totals.paid)}</Text>
                    <Text style={[styles.td, styles.tdTotal]}>{formatMoney(totals.share)}</Text>
                    <Text style={[styles.td, styles.tdTotal]}>0</Text>
                </View>
            </View>

            <View style={styles.transfers}>
                <View style={styles.transfersHeader}>
                    <Text style={[styles.panelTitle, styles.onDark]}>Перекази</Text>
                    <Text style={styles.transfersNote}>
                        {transfers.length > 0 ? `${transfers.length} з ${totalTransfers} очікують` : 'усі розрахувалися'}
                    </Text>
                </View>

                {transfers.length > 0 ? (
                    <View style={styles.transferList}>
                        {transfers.map((transfer, index) => {
                            const key = transferKey(transfer);

                            return (
                                <View
                                    key={key}
                                    style={[styles.transfer, index < transfers.length - 1 && styles.transferDivider]}
                                >
                                    <View style={styles.transferInfo}>
                                        <Text style={styles.transferWho}>
                                            {name(transfer.fromId)} → {name(transfer.toId)}
                                        </Text>
                                        <Text style={styles.transferAmount}>{formatMoney(transfer.amount)} ₴</Text>
                                    </View>
                                    <Pressable
                                        onPress={() => handlePaid(transfer)}
                                        disabled={payingKey !== undefined}
                                        style={({pressed}) => [
                                            styles.paid,
                                            pressed && {borderColor: colors.surface},
                                            payingKey !== undefined && {opacity: 0.6},
                                        ]}
                                    >
                                        <Text style={styles.paidText}>{payingKey === key ? 'Зберігаю…' : 'Оплачено'}</Text>
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <Text style={styles.transfersEmpty}>Ніхто нікому нічого не винен.</Text>
                )}

                {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    // місце під кнопку «+» внизу
    content: {paddingHorizontal: 24, paddingTop: 24, paddingBottom: 112, gap: 24},
    settlement: {gap: 12},
    positive: {color: colors.accent},
    muted: {color: colors.muted},
    onDark: {color: colors.surface},

    card: {
        padding: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 18,
    },
    label: {fontSize: 13, color: colors.muted, fontFamily: fonts.regular},
    stat: {marginTop: 8, fontSize: 32, letterSpacing: -1, color: colors.text, fontFamily: fonts.light},
    statStrong: {fontFamily: fonts.regular},
    statNote: {fontSize: 15, letterSpacing: 0, color: colors.muted, fontFamily: fonts.regular},
    progress: {marginTop: 10, height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden'},
    progressFill: {height: '100%', borderRadius: 3, backgroundColor: colors.accent},

    panel: {
        marginTop: 4,
        padding: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 20,
    },
    panelTable: {paddingTop: 8, paddingBottom: 12},
    panelTitle: {fontSize: 17, color: colors.text, fontFamily: fonts.medium},

    axis: {marginTop: 18, paddingLeft: 64, paddingRight: 72, flexDirection: 'row', justifyContent: 'space-between'},
    axisText: {fontSize: 12, color: colors.muted, fontFamily: fonts.regular},
    bars: {marginTop: 10, gap: 16},
    barRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
    barName: {width: 56, fontSize: 15, color: colors.text, fontFamily: fonts.regular},
    barTrack: {flex: 1, height: 28, flexDirection: 'row'},
    barHalf: {flex: 1, flexDirection: 'row'},
    barHalfNegative: {justifyContent: 'flex-end', borderRightWidth: 1, borderRightColor: colors.text},
    bar: {height: 28},
    barNegative: {backgroundColor: colors.text, borderTopLeftRadius: 6, borderBottomLeftRadius: 6},
    barPositive: {backgroundColor: colors.accent, borderTopRightRadius: 6, borderBottomRightRadius: 6},
    barValue: {width: 62, textAlign: 'right', fontSize: 15, color: colors.text, fontFamily: fonts.semibold},

    tableTitle: {paddingTop: 16, paddingBottom: 6},
    tableRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 8},
    tableHead: {paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider},
    tableRowDivider: {borderBottomWidth: 1, borderBottomColor: colors.rowDivider},
    cellName: {flex: 1.4, textAlign: 'left'},
    th: {flex: 1, textAlign: 'right', fontSize: 12, color: colors.muted, fontFamily: fonts.regular},
    td: {flex: 1, textAlign: 'right', fontSize: 14, color: colors.text, fontFamily: fonts.regular},
    tdMuted: {color: colors.mutedStrong},
    tdStrong: {fontFamily: fonts.semibold},
    tdTotal: {fontFamily: fonts.medium},

    transfers: {marginTop: 4, padding: 24, borderRadius: 20, backgroundColor: colors.text},
    transfersHeader: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 12},
    transfersNote: {fontSize: 12, color: colors.onDarkMuted, fontFamily: fonts.regular},
    transferList: {marginTop: 14},
    transfer: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14},
    transferDivider: {borderBottomWidth: 1, borderBottomColor: colors.onDarkDivider},
    transferInfo: {flex: 1, minWidth: 0},
    transferWho: {fontSize: 14, color: colors.onDarkMuted, fontFamily: fonts.regular},
    transferAmount: {marginTop: 2, fontSize: 22, color: colors.surface, fontFamily: fonts.light},
    paid: {
        height: 44,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.onDarkBorder,
        borderRadius: 22,
        justifyContent: 'center',
    },
    paidText: {fontSize: 14, color: colors.surface, fontFamily: fonts.regular},
    transfersEmpty: {marginTop: 14, fontSize: 14, color: colors.onDarkMuted, fontFamily: fonts.regular},
    actionError: {marginTop: 10, fontSize: 13, color: '#F08A80', fontFamily: fonts.regular},
});
