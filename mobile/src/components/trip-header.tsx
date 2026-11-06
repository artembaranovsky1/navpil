import type {ReactNode} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {router} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, fonts} from '@/color';
import {TripResponse} from '@/api/trips';
import {ExpenseResponse} from '@/api/expense';
import {PaymentResponse} from '@/api/payments';
import {formatMoney, formatSignedMoney, formatTripDates} from '@/context/format';
import {calculateSettlement, totalAmount} from '@/utils/settle';
import {Icon} from '@/components/ui/icon';
import {AvatarStack} from '@/components/ui/avatar';
import {Wordmark} from '@/components/ui/wordmark';

export type TripTab = 'expenses' | 'settle' | 'members';

// шапка над сторінками подорожі: назад до списку і учасники
export function TripTopbar({trip, currentUserId}: { trip: TripResponse; currentUserId?: string }) {
    return (
        <View style={styles.topbar}>
            <Pressable
                onPress={() => router.dismissTo('/trips')}
                hitSlop={8}
                accessibilityLabel="До списку подорожей"
                style={({pressed}) => [styles.back, pressed && {opacity: 0.6}]}
            >
                <Icon name="back" size={18}/>
                <Wordmark/>
            </Pressable>

            <Pressable
                onPress={() => router.replace(`/trip/${trip.id}/member`)}
                accessibilityLabel={`Учасники: ${trip.members.map((member) => member.name).join(', ')}`}
            >
                <AvatarStack members={trip.members} max={3} size={30} currentUserId={currentUserId} monochrome/>
            </Pressable>
        </View>
    );
}

type TripHeaderProps = {
    trip: TripResponse;
    expenses: ExpenseResponse[];
    payments: PaymentResponse[];
    currentUserId?: string;
    active: TripTab;
    // між підсумком і вкладками (наприклад, категорії)
    summary?: ReactNode;
}

// мобільний підсумок подорожі і вкладки — як TripHeader на фронті
export function TripHeader({trip, expenses, payments, currentUserId, active, summary}: TripHeaderProps) {
    const dates = formatTripDates(trip.startDate, trip.endDate);
    const total = totalAmount(expenses);
    const myBalance = currentUserId
        ? calculateSettlement(trip.members, expenses, payments).remaining[currentUserId] ?? 0
        : 0;

    const tabs = [
        {key: 'expenses', label: 'Витрати', href: `/trip/${trip.id}`},
        {key: 'settle', label: 'Розрахунок', href: `/trip/${trip.id}/settle`},
        {key: 'members', label: `Учасники · ${trip.members.length}`, href: `/trip/${trip.id}/member`},
    ] as const;

    return (
        <View style={styles.header}>
            <View style={styles.hero}>
                <Text style={styles.caption}>{trip.name}{dates && ` · ${dates}`}</Text>
                <Text style={styles.total}>
                    {formatMoney(total)} <Text style={styles.currency}>₴</Text>
                </Text>
                <Text style={styles.balance}>
                    Твій баланс{' '}
                    <Text style={[styles.balanceValue, myBalance > 0 && styles.positive]}>
                        {formatSignedMoney(myBalance)} ₴
                    </Text>
                </Text>
            </View>

            {summary}

            {/* вкладки не переносимо — гортаємо вбік */}
            <View style={styles.tabsWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                    {tabs.map((tab) => {
                        const isActive = tab.key === active;

                        return (
                            <Pressable
                                key={tab.key}
                                onPress={() => !isActive && router.replace(tab.href)}
                                style={[styles.tab, isActive && styles.tabActive]}
                                accessibilityRole="tab"
                                accessibilityState={{selected: isActive}}
                            >
                                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
}

// кнопка «Додати витрату» внизу праворуч
export function AddExpenseFab({tripId}: { tripId: string }) {
    const insets = useSafeAreaInsets();

    return (
        <Pressable
            onPress={() => router.push(`/trip/${tripId}/expenses/new`)}
            accessibilityLabel="Додати витрату"
            style={({pressed}) => [
                styles.fab,
                {bottom: 28 + insets.bottom},
                pressed && {transform: [{scale: 0.94}]},
            ]}
        >
            <Icon name="plus" size={22} color={colors.surface} strokeWidth={2}/>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    topbar: {
        paddingTop: 10,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    back: {height: 44, marginLeft: -4, flexDirection: 'row', alignItems: 'center', gap: 4},

    header: {gap: 24},
    hero: {paddingTop: 4},
    caption: {fontSize: 13, color: colors.muted, fontFamily: fonts.regular},
    total: {marginTop: 6, fontSize: 44, lineHeight: 50, letterSpacing: -1.5, color: colors.text, fontFamily: fonts.light},
    currency: {fontSize: 24, color: colors.muted, letterSpacing: 0},
    balance: {marginTop: 10, fontSize: 14, color: colors.muted, fontFamily: fonts.regular},
    balanceValue: {color: colors.text, fontFamily: fonts.semibold},
    positive: {color: colors.accent},

    tabsWrap: {borderBottomWidth: 1, borderBottomColor: colors.divider},
    tabs: {gap: 24},
    tab: {height: 44, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1},
    tabActive: {borderBottomColor: colors.text},
    tabText: {fontSize: 15, color: colors.muted, fontFamily: fonts.regular},
    tabTextActive: {color: colors.text, fontFamily: fonts.semibold},

    fab: {
        position: 'absolute',
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.text,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.text,
        shadowOpacity: 0.22,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 8},
        elevation: 8,
    },
});
