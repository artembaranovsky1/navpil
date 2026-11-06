import {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router, useLocalSearchParams} from 'expo-router';
import {colors, fonts} from '@/color';
import {CATEGORY_LABELS} from '@/api/expense';
import {formatLongDate, formatMoney, pluralize} from '@/context/format';
import {getExpenseShares, getMemberName} from '@/utils/settle';
import {useExpense, useMe, useTrip} from "@/hooks/queries";
import {useDeleteExpense} from "@/hooks/mutations";
import {CategoryIcon} from "@/components/ui/category-icon";
import {Avatar} from "@/components/ui/avatar";
import {Icon} from "@/components/ui/icon";
import {ScreenState} from "@/components/ui/screen-state";

const formatTime = (date: string): string =>
    new Date(date).toLocaleTimeString('uk-UA', {hour: '2-digit', minute: '2-digit'});

export default function ExpenseDetailsScreen() {
    const {id: tripId, expenseId} = useLocalSearchParams<{ id: string; expenseId: string }>();
    const {data: me} = useMe()

    const tripQuery = useTrip(tripId);
    const expenseQuery = useExpense(tripId, expenseId);
    const deleteExpense = useDeleteExpense(tripId);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    if (expenseQuery.isPending || tripQuery.isPending) {
        return <ScreenState/>;
    }

    if (expenseQuery.isError || tripQuery.isError) {
        return <ScreenState error="Не вдалося завантажити витрату"/>;
    }

    const trip = tripQuery.data;
    const expense = expenseQuery.data;
    const members = trip.members;
    const currentUserId = me?.id;

    const payerId = expense.paidById ?? expense.addedById;
    const shares = getExpenseShares(expense, members);
    const payerShare = shares.find((share) => share.id === payerId)?.amount ?? 0;
    // платник першим, далі решта
    const orderedShares = [
        ...shares.filter((share) => share.id === payerId),
        ...shares.filter((share) => share.id !== payerId),
    ];
    const isEqualSplit = shares.every((share) => share.amount === shares[0]?.amount);
    const membersLabel = pluralize(shares.length, ['учасником', 'учасниками', 'учасниками']);

    const name = (userId: string) => getMemberName(members, userId);
    const dateLabel = `${formatLongDate(expense.date ?? expense.createdAt)}, ${formatTime(expense.createdAt)}`;

    const segmentColor = (userId: string): string => {
        if (userId === payerId) return colors.accent;
        if (userId === currentUserId) return colors.text;
        return '#C9C9C3';
    };

    const handleDelete = async () => {
        if (!isConfirmingDelete) {
            setIsConfirmingDelete(true);
            return;
        }

        setError('');

        try {
            await deleteExpense.mutateAsync(expense.id);
            router.back();
        } catch {
            setError('Не вдалося видалити витрату, спробуйте ще раз');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.back()}
                        accessibilityLabel="Закрити"
                        style={({pressed}) => [styles.close, pressed && {backgroundColor: colors.ghostHover}]}
                    >
                        <Icon name="close"/>
                    </Pressable>
                    <Pressable
                        onPress={() => router.push(`/trip/${tripId}/expenses/${expense.id}/editing`)}
                        style={({pressed}) => [styles.edit, pressed && {backgroundColor: colors.ghostHover}]}
                    >
                        <Icon name="edit" size={16}/>
                        <Text style={styles.editText}>Редагувати</Text>
                    </Pressable>
                </View>

                <View style={styles.titleBlock}>
                    <CategoryIcon category={expense.category} size="lg"/>
                    <View style={styles.titleText}>
                        <Text style={styles.title}>{expense.name}</Text>
                        <Text style={styles.meta}>{CATEGORY_LABELS[expense.category]} · {dateLabel}</Text>
                    </View>
                </View>

                <Text style={styles.amount}>
                    {formatMoney(expense.amount)} <Text style={styles.currency}>₴</Text>
                </Text>

                <View style={styles.split}>
                    <View style={styles.splitBar}>
                        {orderedShares.map((share) => (
                            <View key={share.id} style={{flexGrow: share.amount, flexBasis: 0, backgroundColor: segmentColor(share.id)}}/>
                        ))}
                    </View>
                    <Text style={styles.splitNote}>
                        {isEqualSplit
                            ? `Порівну між ${shares.length} ${membersLabel} · по ${formatMoney(shares[0]?.amount ?? 0)} ₴`
                            : `Між ${shares.length} ${membersLabel}`}
                    </Text>
                </View>

                <View style={styles.members}>
                    {shares.every((share) => share.id !== payerId) && (
                        <MemberRow
                            id={payerId}
                            name={name(payerId)}
                            note="оплата, без частки"
                            amount={`+${formatMoney(expense.amount)}`}
                            positive
                            isLast={orderedShares.length === 0}
                        />
                    )}

                    {orderedShares.map((share, index) => {
                        const isPayer = share.id === payerId;

                        return (
                            <MemberRow
                                key={share.id}
                                id={share.id}
                                name={name(share.id)}
                                note={isPayer ? `оплата · частка ${formatMoney(share.amount)}` : 'частка'}
                                amount={isPayer ? `+${formatMoney(expense.amount - payerShare)}` : `−${formatMoney(share.amount)}`}
                                positive={isPayer}
                                isLast={index === orderedShares.length - 1}
                            />
                        );
                    })}
                </View>

                {expense.description ? (
                    <View style={styles.description}>
                        <Text style={styles.descriptionLabel}>Опис</Text>
                        <Text style={styles.descriptionText}>{expense.description}</Text>
                    </View>
                ) : null}

                <View style={styles.spacer}/>

                <Text style={styles.added}>
                    Додано: {name(expense.addedById)} · {formatLongDate(expense.createdAt)}, {formatTime(expense.createdAt)}
                </Text>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Pressable
                    onPress={handleDelete}
                    disabled={deleteExpense.isPending}
                    style={({pressed}) => [
                        styles.delete,
                        pressed && {backgroundColor: colors.errorTint, borderColor: colors.errorTint},
                        deleteExpense.isPending && {opacity: 0.6},
                    ]}
                >
                    <Text style={styles.deleteText}>
                        {deleteExpense.isPending
                            ? 'Видаляю…'
                            : isConfirmingDelete ? 'Натисніть ще раз, щоб видалити' : 'Видалити витрату'}
                    </Text>
                </Pressable>
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
    isLast: boolean;
};

function MemberRow({id, name, note, amount, positive, isLast}: MemberRowProps) {
    return (
        <View style={[styles.member, !isLast && styles.memberDivider]}>
            <Avatar id={id} name={name} size={36}/>
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{name}</Text>
                <Text style={styles.memberNote}>{note}</Text>
            </View>
            <Text style={[styles.memberAmount, positive && styles.memberAmountPositive]}>{amount}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    content: {flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24},

    header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    close: {width: 44, height: 44, marginLeft: -6, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
    edit: {
        height: 40,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        backgroundColor: colors.surface,
    },
    editText: {fontSize: 14, color: colors.text, fontFamily: fonts.regular},

    titleBlock: {marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 14},
    titleText: {flex: 1, minWidth: 0},
    title: {fontSize: 24, letterSpacing: -0.5, color: colors.text, fontFamily: fonts.regular},
    meta: {marginTop: 4, fontSize: 13, color: colors.muted, fontFamily: fonts.regular},

    amount: {marginTop: 22, fontSize: 52, letterSpacing: -1.8, color: colors.text, fontFamily: fonts.light},
    currency: {fontSize: 26, letterSpacing: 0, color: colors.muted},

    split: {marginTop: 16},
    splitBar: {height: 10, flexDirection: 'row', gap: 2, borderRadius: 5, overflow: 'hidden'},
    splitNote: {marginTop: 8, fontSize: 12, color: colors.muted, fontFamily: fonts.regular},

    members: {
        marginTop: 22,
        paddingHorizontal: 18,
        paddingVertical: 4,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 20,
    },
    member: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14},
    memberDivider: {borderBottomWidth: 1, borderBottomColor: colors.rowDivider},
    memberInfo: {flex: 1, minWidth: 0},
    memberName: {fontSize: 15, color: colors.text, fontFamily: fonts.medium},
    memberNote: {marginTop: 2, fontSize: 13, color: colors.muted, fontFamily: fonts.regular},
    memberAmount: {fontSize: 15, color: colors.text, fontFamily: fonts.regular},
    memberAmountPositive: {color: colors.accent, fontFamily: fonts.semibold},

    description: {
        marginTop: 12,
        paddingHorizontal: 18,
        paddingVertical: 14,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 20,
    },
    descriptionLabel: {fontSize: 13, color: colors.muted, fontFamily: fonts.regular},
    descriptionText: {marginTop: 4, fontSize: 15, lineHeight: 22, color: colors.text, fontFamily: fonts.regular},

    spacer: {flex: 1, minHeight: 24},
    added: {marginBottom: 12, fontSize: 12, color: colors.muted, fontFamily: fonts.regular},
    error: {marginBottom: 12, fontSize: 13, color: colors.error, fontFamily: fonts.regular},
    delete: {
        height: 50,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteText: {fontSize: 15, color: colors.error, fontFamily: fonts.medium},
});
