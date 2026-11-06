import {useEffect, useRef, useState} from "react";
import {Pressable, ScrollView, Share, StyleSheet, Text, View} from "react-native";
import {useLocalSearchParams} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import * as Clipboard from 'expo-clipboard';
import {TripMember} from "@/api/trips";
import {useExpenses, useMe, usePayments, useTrip} from "@/hooks/queries";
import {colors, fonts} from "@/color";
import {calculateSettlement} from "@/utils/settle";
import {formatMoney, formatSignedMoney, pluralize} from "@/context/format";
import {AddExpenseFab, TripHeader, TripTopbar} from "@/components/trip-header";
import {Avatar} from "@/components/ui/avatar";
import {Icon} from "@/components/ui/icon";
import {ScreenState} from "@/components/ui/screen-state";

const ROLE_LABELS: Record<TripMember['role'], string> = {
    owner: 'організатор',
    member: 'учасник',
};

export default function MemberScreen() {
    const {id: tripId} = useLocalSearchParams<{ id: string }>();
    const {data: me} = useMe();
    const tripQuery = useTrip(tripId);
    const expensesQuery = useExpenses(tripId);
    const paymentsQuery = usePayments(tripId);

    if (tripQuery.isPending || expensesQuery.isPending || paymentsQuery.isPending) {
        return <ScreenState/>;
    }

    if (tripQuery.isError || expensesQuery.isError || paymentsQuery.isError) {
        return <ScreenState error="Не вдалося завантажити учасників"/>;
    }

    const trip = tripQuery.data;
    const expenses = expensesQuery.data;
    const currentUserId = me?.id;

    const {balances, remaining} = calculateSettlement(trip.members, expenses, paymentsQuery.data);
    const paidById = Object.fromEntries(balances.map((balance) => [balance.id, balance.paid]));

    // поточний користувач — першим, далі організатор
    const sorted = [...trip.members].sort((a, b) =>
        Number(b.id === currentUserId) - Number(a.id === currentUserId) ||
        Number(b.role === 'owner') - Number(a.role === 'owner'));

    const countPaid = (userId: string) =>
        expenses.filter((expense) => (expense.paidById ?? expense.addedById) === userId).length;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <TripTopbar trip={trip} currentUserId={currentUserId}/>

            <ScrollView contentContainerStyle={styles.content}>
                <TripHeader
                    trip={trip}
                    expenses={expenses}
                    payments={paymentsQuery.data}
                    currentUserId={currentUserId}
                    active="members"
                />

                <View style={styles.tableCard}>
                    <Text style={styles.title}>Учасники · {trip.members.length}</Text>

                    <View style={[styles.row, styles.head]}>
                        <Text style={[styles.th, styles.cellMember]}>Учасник</Text>
                        <Text style={[styles.th, styles.cellNumber]}>Заплатив</Text>
                        <Text style={[styles.th, styles.cellNumber]}>Баланс</Text>
                    </View>

                    {sorted.map((member, index) => {
                        const isMe = member.id === currentUserId;
                        const balance = remaining[member.id] ?? 0;
                        const paidCount = countPaid(member.id);

                        return (
                            <View
                                key={member.id}
                                style={[styles.row, index < sorted.length - 1 && styles.rowDivider]}
                            >
                                <View style={[styles.member, styles.cellMember]}>
                                    <Avatar id={member.id} name={member.name} size={38}/>
                                    <View style={styles.memberInfo}>
                                        <Text style={styles.name} numberOfLines={2}>
                                            {member.name}
                                            {isMe && <Text style={styles.you}> · ти</Text>}
                                            {/* на телефоні колонки ролі немає — підписуємо біля імені */}
                                            {member.role === 'owner' && <Text style={styles.you}> · {ROLE_LABELS.owner}</Text>}
                                        </Text>
                                        <Text style={styles.sub} numberOfLines={1}>
                                            {isMe && me?.email
                                                ? me.email
                                                : paidCount > 0
                                                    ? `${paidCount} ${pluralize(paidCount, ['витрата', 'витрати', 'витрат'])}`
                                                    : 'ще без витрат'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.td, styles.cellNumber]}>{formatMoney(paidById[member.id] ?? 0)}</Text>
                                <Text style={[styles.td, styles.cellNumber, styles.balance, balance > 0 && styles.positive]}>
                                    {formatSignedMoney(balance)}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <InviteCard tripName={trip.name} inviteCode={trip.inviteCode}/>
            </ScrollView>

            <AddExpenseFab tripId={tripId}/>
        </SafeAreaView>
    )
}

function InviteCard({tripName, inviteCode}: { tripName: string; inviteCode: string }) {
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => () => clearTimeout(timer.current), []);

    const copyCode = async () => {
        await Clipboard.setStringAsync(inviteCode);
        setIsCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setIsCopied(false), 2000);
    };

    const handleShare = async () => {
        try {
            await Share.share({message: `Приєднуйся до подорожі «${tripName}» у navpil. Код: ${inviteCode}`});
        } catch {
            // користувач закрив діалог «Поділитися» — нічого не робимо
        }
    };

    return (
        <View style={styles.invite}>
            <Text style={[styles.title, styles.onDark]}>Запросити друзів</Text>
            <Text style={styles.inviteLabel}>Код запрошення</Text>
            <Text style={styles.inviteCode} selectable>{inviteCode}</Text>
            <View style={styles.inviteButtons}>
                <Pressable
                    onPress={copyCode}
                    style={({pressed}) => [styles.inviteButton, styles.inviteButtonPrimary, pressed && {opacity: 0.85}]}
                >
                    <Icon name={isCopied ? 'check' : 'copy'} size={16}/>
                    <Text style={styles.inviteButtonText}>{isCopied ? 'Скопійовано' : 'Копіювати'}</Text>
                </Pressable>
                <Pressable
                    onPress={handleShare}
                    style={({pressed}) => [styles.inviteButton, styles.inviteButtonSecondary, pressed && {borderColor: colors.surface}]}
                >
                    <Icon name="share" size={16} color={colors.surface}/>
                    <Text style={[styles.inviteButtonText, styles.onDark]}>Поділитися</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    // місце під кнопку «+» внизу
    content: {paddingHorizontal: 24, paddingTop: 24, paddingBottom: 112, gap: 24},
    positive: {color: colors.accent},
    onDark: {color: colors.surface},

    tableCard: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 20,
    },
    title: {paddingTop: 16, paddingBottom: 6, fontSize: 17, color: colors.text, fontFamily: fonts.medium},
    row: {flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12},
    head: {paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider},
    rowDivider: {borderBottomWidth: 1, borderBottomColor: colors.rowDivider},
    cellMember: {flex: 1, minWidth: 0},
    cellNumber: {minWidth: 64, textAlign: 'right'},
    th: {fontSize: 12, color: colors.muted, fontFamily: fonts.regular},
    td: {fontSize: 14, color: colors.text, fontFamily: fonts.regular},
    balance: {fontFamily: fonts.semibold},
    member: {flexDirection: 'row', alignItems: 'center', gap: 12},
    memberInfo: {flex: 1, minWidth: 0},
    name: {fontSize: 14, color: colors.text, fontFamily: fonts.medium},
    you: {color: colors.muted, fontFamily: fonts.regular},
    sub: {fontSize: 12, color: colors.muted, fontFamily: fonts.regular},

    invite: {padding: 24, paddingTop: 8, borderRadius: 20, backgroundColor: colors.text},
    inviteLabel: {marginTop: 10, fontSize: 13, color: colors.onDarkMuted, fontFamily: fonts.regular},
    inviteCode: {marginTop: 4, fontSize: 34, letterSpacing: 6, color: colors.surface, fontFamily: fonts.medium},
    inviteButtons: {marginTop: 16, flexDirection: 'row', gap: 10},
    inviteButton: {
        flex: 1,
        height: 46,
        borderRadius: 23,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    inviteButtonPrimary: {backgroundColor: colors.surface},
    inviteButtonSecondary: {borderWidth: 1, borderColor: colors.onDarkBorder},
    inviteButtonText: {fontSize: 14, color: colors.text, fontFamily: fonts.medium},
});
