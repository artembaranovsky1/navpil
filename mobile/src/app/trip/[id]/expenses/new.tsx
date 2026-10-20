import {
    ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View
} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import {colors} from "@/color";
import {CATEGORY_LABELS, EXPENSE_CATEGORIES, ExpenseCategory} from "@/api/expense";
import {DateField} from "@/components/date-field";
import {useState} from 'react';
import {router, useLocalSearchParams} from "expo-router";
import {toApiDate} from "@/api/helper";
import {ApiError} from "@/api/ApiError";
import {Chip} from "@/components/chip";
import {useMe, useTrip} from "@/hooks/queries";
import {useCreateExpense} from "@/hooks/mutations";

const getErrorMessage = (error: unknown) => {
    if (!error) return '';
    if (error instanceof ApiError && error.status === 422) return 'Перевірте поля форми';
    if (error instanceof ApiError) return 'Щось пішло не так, спробуйте ще раз';
    return 'Немає з’єднання з сервером';
}

export default function NewExpenseScreen() {
    const {id: tripId} = useLocalSearchParams<{ id: string }>();
    const {data: me} = useMe()

    const {data: trip, isLoading: isTripLoading, error: tripError} = useTrip(tripId)

    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [date, setDate] = useState(toApiDate(new Date()));
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('food');
    const [paidById, setPaidById] = useState<string | null>(null);
    const [splitBetween, setSplitBetween] = useState<string[] | null>(null);
    const [focused, setFocused] = useState<'amount' | 'name' | 'description' | null>(null);
    const [formError, setFormError] = useState('');


    const {mutate, isPending: isCreateExpensePending, error: createError} = useCreateExpense(tripId);
    const errorMessage = formError || getErrorMessage(createError);

    if (isTripLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    if (tripError || !trip) {
        return (
            <View style={styles.center}>
                <Text style={styles.muted}>Не вдалося завантажити подорож</Text>
            </View>
        );
    }
    const payer = paidById ?? me?.id ?? trip.members[0]?.id
    const split = splitBetween ?? trip.members.map(member => member.id);

    const amountNumber = Number(amount.replace(',', '.'));
    const share = split.length > 0 && amountNumber > 0 ? amountNumber / split.length : 0;

    const toggleMember = (memberId: string) => {
        setSplitBetween(
            split.includes(memberId)
                ? split.filter((x) => x !== memberId)
                : [...split, memberId],
        );
    };

    const handleSubmit = () => {
        if (!(amountNumber > 0)) return setFormError('Вкажіть суму');
        if (!name.trim()) return setFormError('Вкажіть, за що');
        if (split.length === 0) return setFormError('Оберіть, між ким ділити');

        setFormError('')
        mutate({
            name: name.trim(),
            amount: amountNumber,
            description: description.trim(),
            category,
            date,
            paidById: payer,
            splitBetween: split
        }, {
            onSuccess: () => {
                setAmount('')
                setName('')
                setDescription('')
                setDate(toApiDate(new Date()))
                setCategory('food')
                setPaidById(null)
                setSplitBetween(null)
                router.back()
            }
        })
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <Text style={styles.title}>Нова витрата</Text>

                    <View style={styles.field}>
                        <Text style={styles.label}>Сума, ₴</Text>
                        <TextInput
                            style={[styles.input, styles.amountInput, focused === 'amount' && styles.inputFocused]}
                            value={amount}
                            onChangeText={setAmount}
                            onFocus={() => setFocused('amount')}
                            onBlur={() => setFocused(null)}
                            placeholder="0"
                            placeholderTextColor={colors.muted}
                            keyboardType="decimal-pad"
                            editable={!isCreateExpensePending}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>За що</Text>
                        <TextInput
                            style={[styles.input, focused === 'name' && styles.inputFocused]}
                            value={name}
                            onChangeText={setName}
                            onFocus={() => setFocused('name')}
                            onBlur={() => setFocused(null)}
                            placeholder="Вечеря в колибі"
                            placeholderTextColor={colors.muted}
                            autoCapitalize="sentences"
                            editable={!isCreateExpensePending}
                        />
                    </View>

                    <DateField label="Дата" value={date} onChange={setDate} disabled={isCreateExpensePending}/>

                    <View style={styles.field}>
                        <Text style={styles.label}>Опис</Text>
                        <TextInput
                            style={[styles.input, focused === 'description' && styles.inputFocused]}
                            value={description}
                            onChangeText={setDescription}
                            onFocus={() => setFocused('description')}
                            onBlur={() => setFocused(null)}
                            placeholder="Борщ, сало, ..."
                            placeholderTextColor={colors.muted}
                            autoCapitalize="sentences"
                            editable={!isCreateExpensePending}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Категорія</Text>
                        <View style={styles.chips}>
                            {EXPENSE_CATEGORIES.map((c) => (
                                <Chip
                                    key={c}
                                    label={CATEGORY_LABELS[c]}
                                    selected={category === c}
                                    disabled={false}
                                    onPress={() => setCategory(c)}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Хто платив</Text>
                        <View style={styles.chips}>
                            {trip.members.map((m) => (
                                <Chip
                                    key={m.id}
                                    label={m.id === me?.id ? `${m.name} (я)` : m.name}
                                    selected={payer === m.id}
                                    disabled={false}
                                    onPress={() => setPaidById(m.id)}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Ділимо між · порівну</Text>
                        {trip.members.map((m) => {
                            const isIn = split.includes(m.id);
                            return (
                                <Pressable key={m.id} onPress={() => toggleMember(m.id)} style={styles.memberRow}>
                                    <View style={[styles.checkbox, isIn && styles.checkboxOn]}>
                                        {isIn ? <Text style={styles.checkmark}>✓</Text> : null}
                                    </View>
                                    <Text style={[styles.memberName, !isIn && {color: colors.muted}]}>{m.name}</Text>
                                    <Text style={styles.memberShare}>
                                        {isIn ? Math.round(share).toLocaleString('uk-UA') : '—'}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
                </ScrollView>

                <View style={styles.footer}>
                    <Pressable
                        onPress={handleSubmit}
                        disabled={isCreateExpensePending}
                        style={({pressed}) => [styles.primaryButton, (pressed || isCreateExpensePending) && {opacity: 0.7}]}
                    >
                        <Text style={styles.primaryButtonText}>
                            {isCreateExpensePending ? 'Зберігаємо…' : 'Зберегти витрату'}
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor:
        colors.background
    }
    ,
    center: {
        flex: 1, alignItems:
            'center', justifyContent:
            'center', backgroundColor:
        colors.background
    }
    ,
    content: {
        padding: 20, gap:
            22
    }
    ,
    title: {
        fontSize: 30, fontWeight:
            '600', color:
        colors.text, letterSpacing:
            -0.5
    }
    ,
    field: {
        gap: 8
    }
    ,
    label: {
        fontSize: 14, color:
        colors.muted
    }
    ,
    input: {
        height: 52,
        borderWidth:
            1,
        borderColor:
        colors.border,
        borderRadius:
            14,
        paddingHorizontal:
            16,
        fontSize:
            16,
        color:
        colors.text,
        backgroundColor:
        colors.surface,
    }
    ,
    amountInput: {
        height: 64, fontSize:
            28, fontWeight:
            '600'
    }
    ,
    inputFocused: {
        borderColor: colors.text
    }
    ,
    chips: {
        flexDirection: 'row', flexWrap:
            'wrap', gap:
            8
    }
    ,
    memberRow: {
        flexDirection: 'row', alignItems:
            'center', gap:
            12, paddingVertical:
            10
    }
    ,
    checkbox: {
        width: 24, height:
            24, borderRadius:
            7,
        borderWidth:
            1.5, borderColor:
        colors.border,
        alignItems:
            'center', justifyContent:
            'center',
    }
    ,
    checkboxOn: {
        backgroundColor: colors.text, borderColor:
        colors.text
    }
    ,
    checkmark: {
        color: colors.surface, fontSize:
            14, fontWeight:
            '700'
    }
    ,
    memberName: {
        flex: 1, fontSize:
            16, color:
        colors.text
    }
    ,
    memberShare: {
        fontSize: 16, color:
        colors.muted
    }
    ,
    error: {
        color: colors.error, fontSize:
            14
    }
    ,
    footer: {
        paddingHorizontal: 20, paddingVertical:
            12
    }
    ,
    primaryButton: {
        height: 56, borderRadius:
            28, backgroundColor:
        colors.text,
        alignItems:
            'center', justifyContent:
            'center',
    }
    ,
    primaryButtonText: {
        color: colors.surface, fontSize:
            15, fontWeight:
            '500'
    }
    ,
    muted: {fontSize: 14, color: '#6B6B66'},
});
