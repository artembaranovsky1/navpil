import {KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useState} from "react";
import {router} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {colors, fonts} from "@/color";
import {ApiError} from "@/api/ApiError";
import {useJoinTrip} from "@/hooks/mutations";
import {BackLink} from "@/components/ui/back-link";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {TextField} from "@/components/ui/text-field";
import {formCardStyles} from "@/components/form-card-styles";

const CODE_LENGTH = 6;

// лишаємо тільки латинські літери й цифри: "krp 482" -> "KRP482"
const normalizeCode = (value: string): string =>
    value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);

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
    // після входу useJoinTrip сам відкриває подорож
    const {mutate, isPending, error, reset} = useJoinTrip();
    const errorMessage = getErrorMessage(error);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <BackLink/>

                    <View style={[styles.card, styles.cardCentered]}>
                        <View style={[styles.icon, styles.iconLarge]}>
                            <Icon name="userPlus" size={22}/>
                        </View>
                        <Text style={[styles.title, styles.joinTitle]}>Приєднатися до подорожі</Text>
                        <Text style={[styles.subtitle, styles.centered]}>
                            Введи код, який тобі надіслав організатор. Після цього побачиш усі витрати й зможеш додавати свої.
                        </Text>

                        <View style={styles.codeField}>
                            <TextField
                                label="Код запрошення"
                                value={code}
                                onChangeText={(value) => {
                                    setCode(normalizeCode(value));
                                    reset();
                                }}
                                error={errorMessage || undefined}
                                hint={`${code.length}/${CODE_LENGTH} символів`}
                                placeholder="ABC123"
                                maxLength={CODE_LENGTH}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                autoComplete="off"
                                returnKeyType="go"
                                onSubmitEditing={() => code.length === CODE_LENGTH && mutate(code)}
                                editable={!isPending}
                                autoFocus
                                inputStyle={styles.codeInput}
                            />
                        </View>

                        <View style={[styles.actions, styles.joinActions]}>
                            <Button
                                size="lg"
                                onPress={() => mutate(code)}
                                loading={isPending}
                                disabled={code.length !== CODE_LENGTH}
                            >
                                Приєднатися
                            </Button>
                            <Pressable onPress={() => router.back()} hitSlop={8}>
                                <Text style={styles.cancel}>Скасувати</Text>
                            </Pressable>
                        </View>
                    </View>

                    <Text style={styles.alt}>
                        Немає коду?{' '}
                        <Text style={styles.altLink} onPress={() => router.replace('/trip/newTrip')}>
                            Створи свою подорож
                        </Text>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = {
    ...formCardStyles,
    ...StyleSheet.create({
        cardCentered: {alignItems: 'center'},
        iconLarge: {width: 52, height: 52, borderRadius: 16},
        joinTitle: {fontSize: 28, textAlign: 'center'},
        centered: {textAlign: 'center'},
        codeField: {marginTop: 28, alignSelf: 'stretch'},
        codeInput: {
            height: 64,
            fontSize: 28,
            letterSpacing: 8,
            textAlign: 'center',
            fontFamily: fonts.medium,
        },
        joinActions: {marginTop: 24, alignSelf: 'stretch'},
        alt: {textAlign: 'center', fontSize: 14, color: colors.muted, fontFamily: fonts.regular},
        altLink: {color: colors.text, fontFamily: fonts.medium, textDecorationLine: 'underline'},
    }),
};
