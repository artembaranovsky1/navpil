import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {colors} from "@/color";
import {SafeAreaView} from "react-native-safe-area-context";
import {useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {joinTrip} from "@/api/trips";
import {router} from "expo-router";
import {ApiError} from "@/api/ApiError";
import {useAuth} from "@/context/auth";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

export default function JoinScreen() {
    const {signOut} = useAuth()

    const [code, setCode] = useState<string>('');
    const [error, setError] = useState<string>('');

    const queryClient = useQueryClient();

    const {mutate, isPending} = useMutation({
        mutationFn: joinTrip,
        onSuccess: async (data) => {
            queryClient.invalidateQueries({queryKey: ['trips']});

            router.push('../trips')
        },
        onError: async (error) => {
            if (error instanceof ApiError && error.status === 404) {
                setError('Подорож з таким кодом не знайдено');
            } else if (error instanceof ApiError && error.status === 422) {
                setError('Код має містити 6 символів');
            } else if (error instanceof ApiError && error.status === 401) {
                await signOut();
                router.push('/login');
            } else {
                setError('Немає з’єднання з сервером');
            }
        }
    })


    const handleSubmit = () => {
        if (!code.trim()) {
            setError('Вкажіть код')
        }

        setError('')
        mutate(code)
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
                    style={styles.input}
                    value={code}
                    onChangeText={setCode}
                    // onFocus={() => setFocused('name')}
                    // onBlur={() => setFocused(null)}
                    placeholder="Сухаріки Flint"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    // onSubmitEditing={() => passwordRef.current?.focus()}
                    editable={!isPending}
                />
            </View>

            <Pressable
                onPress={handleSubmit}
                style={({pressed}) => [styles.primaryButton, pressed && {opacity: 0.85}]}

            >
                <Text style={styles.primaryButtonText}>Приєднатися</Text>
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
