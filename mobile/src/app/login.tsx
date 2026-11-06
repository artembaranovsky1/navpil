import {useRef, useState} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Link} from 'expo-router';

import {login} from '@/api/auth';
import {ApiError} from '@/api/ApiError';
import {useAuth} from "@/context/auth";
import {Button} from '@/components/ui/button';
import {TextField} from '@/components/ui/text-field';
import {Wordmark} from '@/components/ui/wordmark';
import {authStyles} from '@/components/auth-styles';

type LoginFields = 'email' | 'password';
type FieldErrors = Partial<Record<LoginFields, string>>;

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const validate = (email: string, password: string) => {
    const errors: FieldErrors = {};

    if (!email.trim()) {
        errors.email = 'Вкажіть email';
    } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.email = 'Невірний формат email';
    }

    if (!password) {
        errors.password = 'Вкажіть пароль';
    }

    return errors;
};

export default function LoginScreen() {
    const {signIn} = useAuth()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const passwordRef = useRef<TextInput>(null);

    const handleSubmit = async () => {
        setError('');

        const errors = validate(email, password);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setIsLoading(true);

        try {
            const {token} = await login(email.trim(), password);
            await signIn(token);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                setError('Невірний email або пароль');
            } else if (err instanceof ApiError) {
                setError('Щось пішло не так, спробуйте ще раз');
            } else {
                setError('Немає з’єднання з сервером');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <Wordmark size={22}/>

                    <Text style={styles.title}>Вхід</Text>

                    <View style={styles.form}>
                        <TextField
                            label="Email"
                            value={email}
                            onChangeText={(value) => {
                                setEmail(value);
                                setFieldErrors((prev) => ({...prev, email: undefined}));
                            }}
                            error={fieldErrors.email}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                            textContentType="emailAddress"
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                            editable={!isLoading}
                        />

                        <TextField
                            ref={passwordRef}
                            label="Пароль"
                            value={password}
                            onChangeText={(value) => {
                                setPassword(value);
                                setFieldErrors((prev) => ({...prev, password: undefined}));
                            }}
                            error={fieldErrors.password}
                            placeholder="••••••••"
                            secureTextEntry
                            autoCapitalize="none"
                            autoComplete="password"
                            textContentType="password"
                            returnKeyType="go"
                            onSubmitEditing={handleSubmit}
                            editable={!isLoading}
                        />

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <Button size="lg" onPress={handleSubmit} loading={isLoading} style={styles.submit}>
                            Увійти
                        </Button>
                    </View>

                    <Text style={styles.footer}>
                        Ще немає акаунта?{' '}
                        <Link href="/register" style={styles.link}>Зареєструватися</Link>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = authStyles;
