import {KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useState} from 'react';
import {router} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DateField} from '@/components/date-field';
import {ApiError} from '@/api/ApiError';
import {colors, fonts} from '@/color';
import {useCreateTrip} from '@/hooks/mutations';
import {FieldErrors} from '@/utils/expenseValidation';
import {TRIP_DESCRIPTION_MAX, TRIP_NAME_MAX, validateTrip} from '@/utils/tripValidation';
import {BackLink} from '@/components/ui/back-link';
import {Button} from '@/components/ui/button';
import {Icon} from '@/components/ui/icon';
import {TextField} from '@/components/ui/text-field';
import {formCardStyles} from '@/components/form-card-styles';

export default function NewTripScreen() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    // після створення useCreateTrip сам відкриває подорож
    const {mutateAsync, isPending} = useCreateTrip();

    // прибираємо помилку поля, щойно юзер його змінив
    const clearFieldError = (...fields: string[]) => {
        setFieldErrors((prev) => {
            if (!fields.some((field) => prev[field])) return prev;
            const next = {...prev};
            fields.forEach((field) => delete next[field]);
            return next;
        });
    };

    const handleSubmit = async () => {
        setError('');

        const errors = validateTrip({name, description, startDate, endDate});
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            await mutateAsync({
                name: name.trim(),
                description: description.trim() || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                setFieldErrors((err.details ?? {}) as FieldErrors);
            } else if (err instanceof ApiError) {
                setError('Не вдалося створити подорож, спробуйте ще раз');
            } else {
                setError('Немає з’єднання з сервером');
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <BackLink/>

                    <View style={styles.card}>
                        <View style={styles.icon}>
                            <Icon name="home" size={22}/>
                        </View>
                        <Text style={styles.title}>Нова подорож</Text>
                        <Text style={styles.subtitle}>
                            Після створення отримаєш код, щоб запросити друзів і разом вести витрати.
                        </Text>

                        <View style={styles.form}>
                            <TextField
                                label="Назва"
                                value={name}
                                onChangeText={(value) => {
                                    setName(value);
                                    clearFieldError('name');
                                }}
                                error={fieldErrors.name?.[0]}
                                placeholder="Наприклад, Карпати"
                                maxLength={TRIP_NAME_MAX}
                                autoCapitalize="sentences"
                                editable={!isPending}
                            />

                            <View style={styles.field}>
                                <TextField
                                    label={<>Опис <Text style={styles.optional}>· необов’язково</Text></>}
                                    value={description}
                                    onChangeText={(value) => {
                                        setDescription(value);
                                        clearFieldError('description');
                                    }}
                                    error={fieldErrors.description?.[0]}
                                    placeholder="Куди їдемо і з ким"
                                    maxLength={TRIP_DESCRIPTION_MAX}
                                    autoCapitalize="sentences"
                                    multiline
                                    editable={!isPending}
                                />
                                <Text style={styles.counter}>{description.length}/{TRIP_DESCRIPTION_MAX}</Text>
                            </View>

                            <View style={styles.field}>
                                <DateField
                                    label="Початок"
                                    value={startDate}
                                    onChange={(value) => {
                                        setStartDate(value);
                                        clearFieldError('startDate', 'endDate');
                                    }}
                                    disabled={isPending}
                                />
                                {fieldErrors.startDate ? <Text style={styles.error}>{fieldErrors.startDate[0]}</Text> : null}
                            </View>

                            <View style={styles.field}>
                                <DateField
                                    label="Кінець"
                                    value={endDate}
                                    onChange={(value) => {
                                        setEndDate(value);
                                        clearFieldError('endDate');
                                    }}
                                    minimumDate={startDate || undefined}
                                    disabled={isPending}
                                />
                                {fieldErrors.endDate ? <Text style={styles.error}>{fieldErrors.endDate[0]}</Text> : null}
                            </View>
                            <Text style={styles.hint}>Дати можна не вказувати — додаси пізніше.</Text>

                            {error ? <Text style={styles.formError}>{error}</Text> : null}

                            <View style={styles.actions}>
                                <Button size="lg" onPress={handleSubmit} loading={isPending}>
                                    Створити подорож
                                </Button>
                                <Pressable onPress={() => router.back()} hitSlop={8}>
                                    <Text style={styles.cancel}>Скасувати</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = {
    ...formCardStyles,
    ...StyleSheet.create({
        form: {marginTop: 28, gap: 18},
        field: {gap: 6},
        optional: {color: colors.muted},
        counter: {alignSelf: 'flex-end', fontSize: 12, color: colors.faint, fontFamily: fonts.regular},
        hint: {marginTop: -8, fontSize: 12, color: colors.muted, fontFamily: fonts.regular},
    }),
};
