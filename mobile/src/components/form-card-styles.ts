import {StyleSheet} from 'react-native';
import {colors, fonts} from '@/color';

// спільні стилі карток-форм: «Нова подорож» і «Приєднатися»
export const formCardStyles = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    flex: {flex: 1},
    content: {paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, gap: 16},
    card: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 24,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 15,
        backgroundColor: colors.chip,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {marginTop: 18, fontSize: 30, letterSpacing: -0.8, color: colors.text, fontFamily: fonts.regular},
    subtitle: {marginTop: 8, fontSize: 14, lineHeight: 21, color: colors.muted, fontFamily: fonts.regular},
    error: {fontSize: 13, color: colors.error, fontFamily: fonts.regular},
    formError: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: colors.errorTint,
        color: colors.error,
        fontSize: 14,
        fontFamily: fonts.regular,
        overflow: 'hidden',
    },
    actions: {marginTop: 6, alignItems: 'center', gap: 14},
    cancel: {fontSize: 14, color: colors.muted, fontFamily: fonts.regular},
});
