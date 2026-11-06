import {useState} from 'react';
import {KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router} from 'expo-router';
import {colors, fonts} from '@/color';
import {CATEGORY_LABELS, CreateExpenseData, EXPENSE_CATEGORIES, ExpenseCategory} from '@/api/expense';
import {TripMember} from '@/api/trips';
import {ApiError} from '@/api/ApiError';
import {
    EXPENSE_DESCRIPTION_MAX,
    EXPENSE_NAME_MAX,
    FieldErrors,
    parseAmount,
    validateExpense
} from '@/utils/expenseValidation';
import {Chip} from '@/components/chip';
import {DateField} from '@/components/date-field';
import {Button} from '@/components/ui/button';
import {Icon} from '@/components/ui/icon';
import {TextField} from '@/components/ui/text-field';

export type ExpenseFormValues = {
    price: string;
    date: string;
    name: string;
    description: string;
    category?: ExpenseCategory;
    paidById?: string;
    splitBetween: string[];
}

type ExpenseFormProps = {
    title: string;
    members: TripMember[];
    initialValues: ExpenseFormValues;
    isPending: boolean;
    onSubmit: (data: CreateExpenseData) => Promise<unknown>;
}

const formatShare = (amount: number): string =>
    amount.toLocaleString('uk-UA', {maximumFractionDigits: 2});

// форма витрати — як модалка NewExpense / EditExpense на фронті
export function ExpenseForm({title, members, initialValues, isPending, onSubmit}: ExpenseFormProps) {
    const [price, setPrice] = useState(initialValues.price);
    const [date, setDate] = useState(initialValues.date);
    const [name, setName] = useState(initialValues.name);
    const [description, setDescription] = useState(initialValues.description);
    const [category, setCategory] = useState<ExpenseCategory | undefined>(initialValues.category);
    const [paidById, setPaidById] = useState<string | undefined>(initialValues.paidById);
    const [splitBetween, setSplitBetween] = useState<string[]>(initialValues.splitBetween);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const amount = parseAmount(price);
    const share = amount > 0 && splitBetween.length > 0 ? amount / splitBetween.length : 0;

    // прибираємо помилку поля, щойно юзер його змінив
    const clearFieldError = (field: string) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = {...prev};
            delete next[field];
            return next;
        });
    };

    const toggleMember = (memberId: string) => {
        setSplitBetween((current) =>
            current.includes(memberId)
                ? current.filter((id) => id !== memberId)
                : [...current, memberId]
        );
        clearFieldError('splitBetween');
    };

    const fieldError = (field: string) => fieldErrors[field]?.[0];

    const handleSubmit = async () => {
        setError('');

        const errors = validateExpense({price, date, name, description, category, splitBetween});
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0 || !category) return;

        try {
            await onSubmit({
                name: name.trim(),
                description: description.trim() || undefined,
                amount,
                category,
                date,
                paidById,
                splitBetween,
            });
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                setFieldErrors((err.details ?? {}) as FieldErrors);
            } else if (err instanceof ApiError && err.status === 403) {
                setError('Ви не учасник цієї подорожі');
            } else if (err instanceof ApiError) {
                setError('Не вдалося зберегти витрату, спробуйте ще раз');
            } else {
                setError('Немає з’єднання з сервером');
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <Pressable
                        onPress={() => router.back()}
                        accessibilityLabel="Закрити"
                        style={({pressed}) => [styles.close, pressed && {backgroundColor: colors.ghostHover}]}
                    >
                        <Icon name="close"/>
                    </Pressable>
                </View>

                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <TextField
                        label="Сума, ₴"
                        value={price}
                        onChangeText={(value) => {
                            setPrice(value);
                            clearFieldError('amount');
                        }}
                        error={fieldError('amount')}
                        placeholder="0"
                        keyboardType="decimal-pad"
                        editable={!isPending}
                        inputStyle={styles.amountInput}
                    />

                    <View style={styles.field}>
                        <DateField
                            label="Дата"
                            value={date}
                            onChange={(value) => {
                                setDate(value);
                                clearFieldError('date');
                            }}
                            disabled={isPending}
                        />
                        {fieldError('date') ? <Text style={styles.error}>{fieldError('date')}</Text> : null}
                    </View>

                    <TextField
                        label="За що"
                        value={name}
                        onChangeText={(value) => {
                            setName(value);
                            clearFieldError('name');
                        }}
                        error={fieldError('name')}
                        maxLength={EXPENSE_NAME_MAX}
                        autoCapitalize="sentences"
                        editable={!isPending}
                    />

                    <TextField
                        label="Опис"
                        value={description}
                        onChangeText={(value) => {
                            setDescription(value);
                            clearFieldError('description');
                        }}
                        error={fieldError('description')}
                        placeholder="Необов’язково"
                        maxLength={EXPENSE_DESCRIPTION_MAX}
                        autoCapitalize="sentences"
                        multiline
                        editable={!isPending}
                        inputStyle={styles.textarea}
                    />

                    <View style={styles.field}>
                        <Text style={styles.label}>Категорія</Text>
                        <View style={styles.chips}>
                            {EXPENSE_CATEGORIES.map((cat) => (
                                <Chip
                                    key={cat}
                                    label={CATEGORY_LABELS[cat]}
                                    selected={cat === category}
                                    disabled={isPending}
                                    onPress={() => {
                                        setCategory(cat);
                                        clearFieldError('category');
                                    }}
                                />
                            ))}
                        </View>
                        {fieldError('category') ? <Text style={styles.error}>{fieldError('category')}</Text> : null}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Хто платив</Text>
                        <View style={styles.options}>
                            {members.map((member) => {
                                const isActive = member.id === paidById;

                                return (
                                    <Pressable
                                        key={member.id}
                                        onPress={() => setPaidById(member.id)}
                                        disabled={isPending}
                                        accessibilityRole="radio"
                                        accessibilityState={{selected: isActive}}
                                        style={[styles.option, isActive && styles.optionActive]}
                                    >
                                        <View style={[styles.radio, isActive && styles.radioActive]}>
                                            {isActive && <View style={styles.radioDot}/>}
                                        </View>
                                        <Text style={[styles.optionName, isActive && styles.optionNameActive]} numberOfLines={1}>
                                            {member.name}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                        {fieldError('paidById') ? <Text style={styles.error}>{fieldError('paidById')}</Text> : null}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Ділимо між · порівну</Text>
                        <View style={styles.options}>
                            {members.map((member) => {
                                const isSelected = splitBetween.includes(member.id);

                                return (
                                    <Pressable
                                        key={member.id}
                                        onPress={() => toggleMember(member.id)}
                                        disabled={isPending}
                                        accessibilityRole="checkbox"
                                        accessibilityState={{checked: isSelected}}
                                        style={styles.option}
                                    >
                                        <View style={[styles.checkbox, isSelected && styles.checkboxOn]}>
                                            {isSelected && <Icon name="check" size={14} color={colors.surface} strokeWidth={2.4}/>}
                                        </View>
                                        <Text style={styles.optionName} numberOfLines={1}>{member.name}</Text>
                                        {isSelected && share > 0 && <Text style={styles.share}>{formatShare(share)}</Text>}
                                    </Pressable>
                                );
                            })}
                        </View>
                        {fieldError('splitBetween') ? <Text style={styles.error}>{fieldError('splitBetween')}</Text> : null}
                    </View>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <View style={styles.actions}>
                        <Button variant="secondary" size="lg" onPress={() => router.back()} disabled={isPending}
                                style={styles.action}>
                            Скасувати
                        </Button>
                        <Button size="lg" onPress={handleSubmit} loading={isPending} style={styles.action}>
                            Зберегти
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    flex: {flex: 1},
    header: {
        paddingHorizontal: 24,
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {fontSize: 24, letterSpacing: -0.6, color: colors.text, fontFamily: fonts.regular},
    close: {width: 44, height: 44, marginRight: -10, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
    content: {paddingHorizontal: 24, paddingTop: 18, paddingBottom: 32, gap: 18},

    field: {gap: 6},
    label: {marginBottom: 2, fontSize: 13, color: colors.mutedStrong, fontFamily: fonts.regular},
    error: {fontSize: 13, color: colors.error, fontFamily: fonts.regular},
    amountInput: {height: 56, fontSize: 24, fontFamily: fonts.light},
    textarea: {minHeight: 52},

    chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},

    options: {gap: 6},
    option: {
        height: 44,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        backgroundColor: colors.surface,
    },
    optionActive: {borderColor: colors.text},
    optionName: {flex: 1, minWidth: 0, fontSize: 14, color: colors.text, fontFamily: fonts.regular},
    optionNameActive: {fontFamily: fonts.medium},
    share: {fontSize: 14, color: colors.muted, fontFamily: fonts.regular},
    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: colors.faint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioActive: {borderColor: colors.text},
    radioDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: colors.text},
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: colors.faint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxOn: {backgroundColor: colors.text, borderColor: colors.text},

    actions: {marginTop: 6, flexDirection: 'row', gap: 10},
    action: {flex: 1, alignSelf: 'auto', paddingHorizontal: 12},
});
