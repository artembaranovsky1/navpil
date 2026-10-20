import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {router, useLocalSearchParams} from "expo-router";
import {colors} from "@/color";
import {formatMoney, formatSignedMoney, formatTripDates} from "@/context/format";
import {calculateSettlement, countTripDays, totalAmount} from "@/utils/settle";
import {useExpenses, useMe, usePayments, useTrip} from "@/hooks/queries";
import {SafeAreaView} from "react-native-safe-area-context";

export default function TripScreen() {
    const { id: tripId } = useLocalSearchParams<{ id: string }>();
    const { data: me } = useMe();
    const { data: trip, isLoading: isTripLoading, error: tripError } = useTrip(tripId);
    const { data: expenses = [], isLoading: isExpensesLoading, error: expensesError } = useExpenses(tripId);
    const { data: payments = [], isLoading: isPaymentsLoading, error: paymentsError } = usePayments(tripId);

    if (isTripLoading || isExpensesLoading || isPaymentsLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
            </View>
        );
    }

    if (tripError || expensesError || paymentsError || !trip) {
        return (
            <View style={styles.center}>
                <Text style={styles.muted}>Не вдалося завантажити подорож</Text>
            </View>
        );
    }

    const dates = formatTripDates(trip.startDate, trip.endDate);
    const { balances, remaining } = calculateSettlement(trip.members, expenses, payments);

    const total = totalAmount(expenses);
    const myRemaining = me?.id ? remaining[me.id] ?? 0 : 0;
    const myShare = balances.find((b) => b.id === me?.id)?.share ?? 0;
    const days = countTripDays(trip);
    const perDay = days > 0 ? total / days : 0;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <Text style={styles.muted}>{trip.name} · {dates && `${dates}`} {trip.inviteCode}</Text>
                <Text style={styles.title}>{formatMoney(total)} ₴</Text>
                <Text style={styles.muted}>твій баланс {formatSignedMoney(myRemaining)} ₴</Text>


                {expenses.map((expense) => (
                    <Pressable key={expense.id} onPress={() => router.push(`/trip/${tripId}/expenses/${expense.id}`)}>
                        <Text style={styles.muted}>{expense.name} {expense.amount} ₴</Text>
                    </Pressable>
                ))}
            </View>

            <Pressable
                style={({pressed}) => [styles.button, pressed && {opacity: 0.85}]}
                onPress={() => router.push(`/trip/${tripId}/member`)}
            >
                <Text style={styles.buttonText}>Учасники</Text>
            </Pressable>

            <Pressable
                style={({pressed}) => [styles.button, pressed && {opacity: 0.85}]}
                onPress={() => router.push(`/trip/${tripId}/settle`)}
            >
                <Text style={styles.buttonText}>Витрати</Text>
            </Pressable>


            <Pressable
                style={({pressed}) => [styles.button, pressed && {opacity: 0.85}]}
                onPress={() => router.push(`/trip/${tripId}/expenses/new`)}
            >
                <Text style={styles.buttonText}>Додати нову витрату</Text>
            </Pressable>

        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 20,
    },
    center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    logo: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.accent,
    },
    title: {
        fontSize: 30,
        fontWeight: '600',
        color: '#111111',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: colors.muted,
        marginTop: -12,
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        color: colors.muted,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.text,
        backgroundColor: colors.surface,
    },
    inputFocused: {
        borderColor: colors.text,
    },
    error: {
        color: colors.error,
        fontSize: 14,
    },
    muted: {fontSize: 14, color: '#6B6B66'},
    button: {
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.text,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    buttonPressed: {
        opacity: 0.85,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 14,
        color: colors.muted,
    },
    link: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    primaryButton: {
        height: 56,
        borderRadius: 28,
        backgroundColor: '#111111',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '500',
    }
});
