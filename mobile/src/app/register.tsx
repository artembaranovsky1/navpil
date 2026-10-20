import { useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { register} from '@/api/auth';
import { ApiError } from '@/api/ApiError';


const colors = {
    background: '#FAFAF9',
    surface: '#FFFFFF',
    text: '#111111',
    muted: '#6B6B66',
    border: '#E2E2DD',
    accent: '#0F8A5F',
    error: '#C23B30',
};

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focused, setFocused] = useState<'name' | 'email' | 'password' | null>(null);

    const passwordRef = useRef<TextInput>(null);

    const handleSubmit = async () => {
        if (!name.trim() || !email.trim() || !password) {
            setError('Заповніть всі поля');
            return;
        }

        setError('')
        setIsLoading(true);

        try {
            await register(name, email, password);

            //
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setError('Цей email уже зареєстрований');
            } else if (err instanceof ApiError && err.status === 422) {
                // setFieldErrors((err.details ?? {}) as Record<string, string[]>);
                setError('Якась помилка')
            } else if (err instanceof ApiError) {
                setError("Щось пішло не так, спробуй ще")
            } else {
                setError("Немає зєднання")
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Text style={styles.logo}>navpil</Text>
                <Text style={styles.title}>Peєстрація</Text>
                <Text style={styles.subtitle}>Рахуйте спільні витрати в подорожі</Text>

                <View style={styles.field}>
                    <Text style={styles.label}>Імʼя</Text>
                    <TextInput
                        style={[styles.input, focused === 'name' && styles.inputFocused]}
                        value={name}
                        onChangeText={setName}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        placeholder="Антон"
                        placeholderTextColor={colors.muted}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="name"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        editable={!isLoading}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[styles.input, focused === 'email' && styles.inputFocused]}
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused(null)}
                        placeholder="you@example.com"
                        placeholderTextColor={colors.muted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        editable={!isLoading}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Пароль</Text>
                    <TextInput
                        ref={passwordRef}
                        style={[styles.input, focused === 'password' && styles.inputFocused]}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocused('password')}
                        onBlur={() => setFocused(null)}
                        placeholder="••••••••"
                        placeholderTextColor={colors.muted}
                        secureTextEntry
                        autoCapitalize="none"
                        autoComplete="password"
                        textContentType="password"
                        returnKeyType="go"
                        onSubmitEditing={handleSubmit}
                        editable={!isLoading}
                    />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Pressable
                    onPress={handleSubmit}
                    disabled={isLoading}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                        isLoading && styles.buttonDisabled,
                    ]}
                >
                    <Text style={styles.buttonText}>{isLoading ? 'Реєстраціяі…' : 'Зареєструватися'}</Text>
                </Pressable>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Вже є акаунт?</Text>
                    <Link href="/login" style={styles.link}>
                        Увійти
                    </Link>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
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
    logo: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.accent,
    },
    title: {
        fontSize: 30,
        fontWeight: '600',
        color: colors.text,
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
});