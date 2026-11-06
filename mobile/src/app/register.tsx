import {useRef, useState} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Link} from 'expo-router';

import {login, register} from '@/api/auth';
import {ApiError} from '@/api/ApiError';
import {useAuth} from '@/context/auth';
import {Button} from '@/components/ui/button';
import {TextField} from '@/components/ui/text-field';
import {Wordmark} from '@/components/ui/wordmark';
import {authStyles as styles} from '@/components/auth-styles';

type RegisterFields = 'name' | 'email' | 'password';
type FieldErrors = Partial<Record<RegisterFields, string>>;

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const validate = (name: string, email: string, password: string) => {
    const errors: FieldErrors = {};

    if (name.trim().length < 3) {
        errors.name = 'Імʼя повинно складатися хоча б з 3 літер';
    }

    if (!email.trim()) {
        errors.email = 'Вкажіть email';
    } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.email = 'Невірний формат email';
    }

    if (!password.trim()) {
        errors.password = 'Вкажіть пароль';
    } else if (password.length < 8) {
        errors.password = 'Пароль має складатися хоча б з 8 символів';
    }

    return errors;
};

export default function RegisterScreen() {
    const {signIn} = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);

    const clearFieldError = (field: RegisterFields) => {
        setFieldErrors((prev) => ({...prev, [field]: undefined}));
    };

    const handleSubmit = async () => {
        setError('');

        const errors = validate(name, email, password);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setIsLoading(true);

        try {
            await register(name.trim(), email.trim(), password);
            // одразу входимо — як на фронті після реєстрації
            const {token} = await login(email.trim(), password);
            await signIn(token);
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setError('Цей email уже зареєстрований');
            } else if (err instanceof ApiError && err.status === 422) {
                setError('Перевірте поля форми');
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

                    <Text style={styles.title}>Створити акаунт</Text>
                    <Text style={styles.subtitle}>Друзі побачать ваше імʼя у спільних подорожах.</Text>

                    <View style={styles.form}>
                        <TextField
                            label="Імʼя"
                            value={name}
                            onChangeText={(value) => {
                                setName(value);
                                clearFieldError('name');
                            }}
                            error={fieldErrors.name}
                            placeholder="Антон"
                            autoCorrect={false}
                            autoComplete="name"
                            textContentType="name"
                            returnKeyType="next"
                            onSubmitEditing={() => emailRef.current?.focus()}
                            editable={!isLoading}
                        />

                        <TextField
                            ref={emailRef}
                            label="Email"
                            value={email}
                            onChangeText={(value) => {
                                setEmail(value);
                                clearFieldError('email');
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
                                clearFieldError('password');
                            }}
                            error={fieldErrors.password}
                            placeholder="Щонайменше 8 символів"
                            secureTextEntry
                            autoCapitalize="none"
                            autoComplete="new-password"
                            textContentType="newPassword"
                            returnKeyType="go"
                            onSubmitEditing={handleSubmit}
                            editable={!isLoading}
                        />

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <Button size="lg" onPress={handleSubmit} loading={isLoading} style={styles.submit}>
                            Зареєструватися
                        </Button>
                    </View>

                    <Text style={styles.footer}>
                        Вже є акаунт?{' '}
                        <Link href="/login" style={styles.link}>Увійти</Link>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
