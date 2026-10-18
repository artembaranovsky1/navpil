import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useAuth} from "@/context/auth";
import {useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {DateField} from "@/components/date-field";
import {router} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {createTrip} from "@/api/trips";
import {ApiError} from "@/api/ApiError";
import {colors} from "@/color";
import {useMutation, useQueryClient} from "@tanstack/react-query";

export default function NewTripScreen() {
    const {signOut} = useAuth()

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focused, setFocused] = useState<'name' | 'description' | 'startDate' | 'endDate' | null>(null);

    const queryClient = useQueryClient();

    const {mutate, isPending} = useMutation({
        mutationFn: createTrip,
        onSuccess: async (trip) => {
            queryClient.invalidateQueries({queryKey: ['trips']})
            router.replace('../trips');
        },
        onError: async (err) => {
            if (err instanceof ApiError && err.status === 422) {
                setError('Помилка 422');
            } else if (err instanceof ApiError && err.status === 401) {
                await signOut()
            } else if (err instanceof ApiError) {
                setError('Не вдалося створити подорож, спробуйте ще раз')
            } else {
                setError('Немає з’єднання з сервером')
            }
        }
    })

    const handleSubmit = () => {
        if (!name.trim()) {
            setError('Вкажіть назву подорожі');
            return
        }

        setError('')
        mutate(
            {
                name: name.trim(),
                description: description.trim() || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            })
    }

    if (isPending) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }


    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.muted}>Не вдалося завантажити подорожі</Text>
            </View>
        );
    }


    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Нова подорож</Text>

            <View style={styles.field}>
                <Text style={styles.label}>Назва</Text>

                <TextInput
                    style={[styles.input, focused === 'name' && styles.inputFocused]}
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    placeholder="Сухаріки Flint"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="name"
                    returnKeyType="next"
                    editable={!isLoading}
                />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Опис</Text>
                <TextInput
                    style={[styles.input, focused === 'description' && styles.inputFocused]}
                    value={description}
                    onChangeText={setDescription}
                    onFocus={() => setFocused('description')}
                    onBlur={() => setFocused(null)}
                    placeholder="Смак сметака та зелень"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    editable={!isLoading}
                />
            </View>


            <DateField label="Початок" value={startDate} onChange={setStartDate}/>
            <DateField
                label="Кінець"
                value={endDate}
                onChange={setEndDate}
                minimumDate={startDate || undefined}
            />

            <Pressable
                style={({pressed}) => [styles.primaryButton, pressed && {opacity: 0.85}]}
                onPress={() => handleSubmit()}
            >
                <Ionicons name="add" size={20} color="#FFFFFF"/>
                <Text style={styles.primaryButtonText}>Нова подорож</Text>
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
