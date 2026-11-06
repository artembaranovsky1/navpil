import {Pressable, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {TripResponse, TripSummary} from "@/api/trips";
import {router} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {useMe, useTrips, useTripsSummary} from "@/hooks/queries";
import {colors, fonts} from "@/color";
import {formatMoney, formatSignedMoney, formatTripDates, pluralize} from "@/context/format";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {AvatarStack} from "@/components/ui/avatar";
import {ScreenState} from "@/components/ui/screen-state";
import {Wordmark} from "@/components/ui/wordmark";

const DAY_MS = 24 * 60 * 60 * 1000;

// скільки днів до початку подорожі (за календарем, без часових поясів)
const daysUntil = (date: string): number => {
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((Date.parse(date.slice(0, 10)) - today) / DAY_MS);
};

const getBadge = (trip: TripResponse): string => {
    if (trip.status === 'past') return 'завершена';
    if (!trip.startDate) return 'скоро';

    const days = daysUntil(trip.startDate);
    if (days <= 0) return 'скоро';
    if (days === 1) return 'завтра';
    return `через ${days} ${pluralize(days, ['день', 'дні', 'днів'])}`;
};

const todayLabel = (): string => {
    const label = new Date().toLocaleDateString('uk-UA', {weekday: 'long', month: 'long', day: 'numeric'});
    return label.charAt(0).toUpperCase() + label.slice(1);
};

export default function TripsScreen() {
    const tripsQuery = useTrips();
    const meQuery = useMe();
    // без підсумків екран все одно працює — замість цифр буде «—»
    const summaryQuery = useTripsSummary();
    const summary = summaryQuery.data ?? null;

    if (tripsQuery.isPending || meQuery.isPending) {
        return <ScreenState/>;
    }

    if (tripsQuery.isError || meQuery.isError) {
        return <ScreenState error="Не вдалося завантажити подорожі"/>;
    }

    const {active, upcoming, past} = tripsQuery.data;
    const hasTrips = active.length + upcoming.length + past.length > 0;
    const myBalance = summary?.myBalance ?? 0;

    const refresh = () => {
        tripsQuery.refetch();
        summaryQuery.refetch();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={tripsQuery.isRefetching} onRefresh={refresh}/>}
            >
                <View style={styles.header}>
                    <Wordmark/>
                    {/* профіль — як кнопка з ініціалом у мобільній шапці фронту */}
                    <Pressable
                        onPress={() => router.push('/profile')}
                        accessibilityLabel="Профіль"
                        style={({pressed}) => [styles.profile, pressed && {backgroundColor: colors.textHover}]}
                    >
                        <Text style={styles.profileText}>{meQuery.data.name.trim().charAt(0).toUpperCase()}</Text>
                    </Pressable>
                </View>

                <View>
                    <Text style={styles.date}>{todayLabel()}</Text>
                    <Text style={styles.hello}>Привіт, {meQuery.data.name}</Text>
                </View>

                <View style={styles.actions}>
                    <Button variant="white" onPress={() => router.push('/trip/join')} style={styles.action}>
                        Приєднатися за кодом
                    </Button>
                    <Button icon="plus" onPress={() => router.push('/trip/newTrip')} style={styles.action}>
                        Нова подорож
                    </Button>
                </View>

                <View style={styles.stats}>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>
                            {myBalance < 0 ? 'Ти загалом маєш віддати' : 'Тобі загалом винні'}
                        </Text>
                        <Text style={[styles.statValue, myBalance > 0 && styles.positive]}>
                            {summary ? `${formatSignedMoney(myBalance)} ₴` : '—'}
                        </Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Подорожей цього року</Text>
                        <Text style={styles.statValue}>{summary?.tripsThisYear ?? '—'}</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Витрачено разом</Text>
                        <Text style={styles.statValue}>{summary ? `${formatMoney(summary.totalSpent)} ₴` : '—'}</Text>
                    </View>
                </View>

                {!hasTrips && (
                    <View style={styles.empty}>
                        <View style={styles.emptyIcon}>
                            <Icon name="home" size={24}/>
                        </View>
                        <Text style={styles.emptyTitle}>Поки що жодної подорожі</Text>
                        <Text style={styles.emptyText}>
                            Створи нову подорож і запроси друзів або приєднайся до існуючої за кодом.
                        </Text>
                        <Button onPress={() => router.push('/trip/newTrip')}>Створити подорож</Button>
                    </View>
                )}

                {active.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Зараз</Text>
                        {active.map((trip) => (
                            <ActiveTrip key={trip.id} trip={trip} summary={summary?.trips[trip.id]}/>
                        ))}
                    </View>
                )}

                <TripSection title="Майбутні" trips={upcoming}/>
                <TripSection title="Минулі" trips={past}/>
            </ScrollView>
        </SafeAreaView>
    )
}

function TripSection({title, trips}: { title: string; trips: TripResponse[] }) {
    if (trips.length === 0) return null;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <View style={styles.count}>
                    <Text style={styles.countText}>{trips.length}</Text>
                </View>
            </View>
            {trips.map((trip) => <TripCard key={trip.id} trip={trip}/>)}
        </View>
    );
}

// поточна подорож — чорна картка, як ActiveBlock на фронті
function ActiveTrip({trip, summary}: { trip: TripResponse; summary?: TripSummary }) {
    const dates = formatTripDates(trip.startDate, trip.endDate);

    return (
        <Pressable
            onPress={() => router.push(`/trip/${trip.id}`)}
            style={({pressed}) => [styles.active, pressed && {backgroundColor: colors.textHover}]}
        >
            <View style={styles.activeTop}>
                <Text style={styles.activeName}>{trip.name}</Text>
                <View style={styles.activeStatus}>
                    <View style={styles.activeDot}/>
                    <Text style={styles.activeStatusText}>триває</Text>
                </View>
            </View>
            <Text style={styles.activeMeta}>
                {dates || 'Без дат'} · {trip.members.map((member) => member.name).join(', ')}
            </Text>

            <View style={styles.activeExpenses}>
                <View>
                    <Text style={styles.activeLabel}>витрачено</Text>
                    <Text style={styles.activeValue}>{summary ? `${formatMoney(summary.total)} ₴` : '—'}</Text>
                </View>
                <View>
                    <Text style={styles.activeLabel}>твій баланс</Text>
                    <Text style={[styles.activeValue, summary && summary.myBalance > 0 && styles.activePositive]}>
                        {summary ? `${formatSignedMoney(summary.myBalance)} ₴` : '—'}
                    </Text>
                </View>
            </View>

            {/* на телефоні аватарки — окремим рядком під сумами */}
            <View style={styles.activeAvatars}>
                <AvatarStack
                    members={trip.members}
                    max={4}
                    size={36}
                    ringColor={colors.text}
                    moreBackground={colors.textHover}
                    moreColor={colors.surface}
                />
            </View>
        </Pressable>
    );
}

function TripCard({trip}: { trip: TripResponse }) {
    const dates = formatTripDates(trip.startDate, trip.endDate);
    const membersCount = trip.members.length;
    const isPast = trip.status === 'past';

    return (
        <Pressable
            onPress={() => router.push(`/trip/${trip.id}`)}
            style={({pressed}) => [styles.card, pressed && {borderColor: '#D6D6D0', opacity: 0.9}]}
        >
            <View style={styles.cardIcon}>
                <Icon name={isPast ? 'house' : 'calendar'} color={isPast ? colors.muted : colors.text}/>
            </View>

            <View>
                <Text style={styles.cardTitle} numberOfLines={1}>{trip.name}</Text>
                <Text style={styles.cardMeta}>
                    {dates || 'Без дат'} · {membersCount} {pluralize(membersCount, ['учасник', 'учасники', 'учасників'])}
                </Text>
            </View>

            <View style={styles.cardFooter}>
                <AvatarStack members={trip.members} max={3} size={28} ringColor={colors.surface}/>
                <View style={[styles.badge, !isPast && styles.badgeUpcoming]}>
                    <Text style={[styles.badgeText, !isPast && styles.badgeTextUpcoming]}>{getBadge(trip)}</Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    content: {paddingHorizontal: 24, paddingTop: 10, paddingBottom: 32, gap: 24},
    positive: {color: colors.accent},

    header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    profile: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.text,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileText: {fontSize: 15, color: colors.surface, fontFamily: fonts.medium},

    date: {fontSize: 13, color: colors.muted, fontFamily: fonts.regular},
    hello: {marginTop: 6, fontSize: 30, letterSpacing: -1, color: colors.text, fontFamily: fonts.regular},

    actions: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
    action: {flexGrow: 1},

    stats: {gap: 12},
    stat: {
        padding: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 18,
    },
    statLabel: {fontSize: 13, color: colors.muted, fontFamily: fonts.regular},
    statValue: {marginTop: 8, fontSize: 32, letterSpacing: -1, color: colors.text, fontFamily: fonts.light},

    section: {gap: 14},
    sectionHeader: {flexDirection: 'row', alignItems: 'center', gap: 8},
    sectionTitle: {fontSize: 17, color: colors.text, fontFamily: fonts.medium},
    count: {
        minWidth: 22,
        height: 22,
        paddingHorizontal: 7,
        borderRadius: 11,
        backgroundColor: colors.chip,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countText: {fontSize: 12, color: colors.mutedStrong, fontFamily: fonts.medium},

    empty: {
        paddingVertical: 48,
        paddingHorizontal: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border,
        borderRadius: 24,
        alignItems: 'center',
        gap: 12,
    },
    emptyIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: colors.chip,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {marginTop: 4, fontSize: 20, color: colors.text, fontFamily: fonts.medium, textAlign: 'center'},
    emptyText: {
        marginBottom: 8,
        fontSize: 14,
        lineHeight: 21,
        color: colors.muted,
        fontFamily: fonts.regular,
        textAlign: 'center',
    },

    active: {padding: 22, borderRadius: 24, backgroundColor: colors.text, gap: 14},
    activeTop: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12},
    activeName: {fontSize: 28, letterSpacing: -0.6, color: colors.surface, fontFamily: fonts.medium},
    activeStatus: {
        height: 26,
        paddingHorizontal: 10,
        borderRadius: 13,
        backgroundColor: colors.accent,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    activeDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surface},
    activeStatusText: {fontSize: 12, color: colors.surface, fontFamily: fonts.medium},
    activeMeta: {fontSize: 14, color: colors.onDarkMuted, fontFamily: fonts.regular},
    activeExpenses: {marginTop: 6, flexDirection: 'row', gap: 32},
    activeAvatars: {marginTop: 10, flexDirection: 'row'},
    activeLabel: {fontSize: 12, color: colors.onDarkMuted, fontFamily: fonts.regular},
    activeValue: {marginTop: 2, fontSize: 30, letterSpacing: -1, color: colors.surface, fontFamily: fonts.light},
    activePositive: {color: colors.accentOnDark},

    card: {
        padding: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 20,
        gap: 16,
    },
    cardIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.chip,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {fontSize: 17, color: colors.text, fontFamily: fonts.medium},
    cardMeta: {marginTop: 4, fontSize: 13, color: colors.muted, fontFamily: fonts.regular},
    cardFooter: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8},
    badge: {
        height: 26,
        paddingHorizontal: 10,
        borderRadius: 13,
        backgroundColor: colors.chip,
        justifyContent: 'center',
    },
    badgeUpcoming: {backgroundColor: colors.accentTint},
    badgeText: {fontSize: 12, color: colors.mutedStrong, fontFamily: fonts.regular},
    badgeTextUpcoming: {color: colors.accent},
});
