import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {colors} from "@/color";
import {SafeAreaView} from "react-native-safe-area-context";
import {useState} from "react";
import {ApiError} from "@/api/ApiError";
import {useJoinTrip} from "@/hooks/mutations";

const getErrorMessage = (error: unknown) => {
    if (!error) return '';
    if (error instanceof ApiError && error.status === 404) return 'Подорож з таким кодом не знайдено';
    if (error instanceof ApiError && error.status === 422) return 'Код має містити 6 символів';
    if (error instanceof ApiError && error.status === 409) return 'Ти вже в цій подорожі';
    if (error instanceof ApiError) return 'Щось пішло не так, спробуйте ще раз';
    return 'Немає з’єднання з сервером';
}

export default function JoinScreen() {

    const [code, setCode] = useState<string>('');
    const {mutate, isPending, error} = useJoinTrip()

    const errorMessage = getErrorMessage(error)

    // if (isPending) {
    //     return (
    //         <View style={styles.center}>
    //             <ActivityIndicator/>
    //         </View>
    //     );
    // }
    //
    // if (error) {
    //     return (
    //         <View style={styles.center}>
    //             <Text style={styles.muted}>Не вдалося завантажити подорожі</Text>
    //         </View>
    //     );
    // }


    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Нова подорож</Text>

            <View style={styles.field}>
                <Text style={styles.label}>Назва</Text>

                <TextInput
                    style={styles.input}
                    value={code}
                    onChangeText={setCode}
                    placeholder="H5FJO1"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    editable={!isPending}
                />
            </View>

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <Pressable
                onPress={() => mutate(code.trim())}
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
