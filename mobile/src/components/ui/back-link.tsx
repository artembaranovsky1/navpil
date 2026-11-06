import {Pressable, StyleSheet, Text} from 'react-native';
import {router} from 'expo-router';
import {colors, fonts} from '@/color';
import {Icon} from '@/components/ui/icon';

// «← Мої подорожі» над карткою форми
export function BackLink({label = 'Мої подорожі'}: { label?: string }) {
    return (
        <Pressable
            onPress={() => router.back()}
            style={({pressed}) => [styles.back, pressed && {backgroundColor: colors.ghostHover}]}
        >
            <Icon name="arrowLeft" size={16} color={colors.muted} strokeWidth={2}/>
            <Text style={styles.text}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    back: {
        alignSelf: 'flex-start',
        height: 36,
        paddingLeft: 8,
        paddingRight: 12,
        marginLeft: -8,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    text: {fontSize: 14, color: colors.muted, fontFamily: fonts.regular},
});
