import {StyleSheet} from 'react-native';
import {colors, fonts} from '@/color';

// спільні стилі екранів входу й реєстрації
export const authStyles = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    flex: {flex: 1},
    content: {flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24, gap: 24},
    title: {fontSize: 30, letterSpacing: -0.8, color: colors.text, fontFamily: fonts.regular},
    subtitle: {marginTop: -16, fontSize: 14, lineHeight: 20, color: colors.muted, fontFamily: fonts.regular},
    form: {gap: 16},
    error: {fontSize: 14, color: colors.error, fontFamily: fonts.regular},
    submit: {marginTop: 8},
    footer: {textAlign: 'center', fontSize: 14, color: colors.muted, fontFamily: fonts.regular},
    link: {fontSize: 14, color: colors.text, fontFamily: fonts.medium, textDecorationLine: 'underline'},
});
