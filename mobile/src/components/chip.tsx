import {Pressable, StyleSheet, Text} from 'react-native';
import {colors, fonts} from '@/color';

type Props = {
    label: string;
    selected: boolean;
    onPress: () => void;
    disabled: boolean;
}

// як .new-expense__chip на фронті: обраний — зелений
export function Chip({label, selected, onPress, disabled}: Props) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{selected, disabled}}
            style={({pressed}) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && {opacity: 0.8}
            ]}
        >
            <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: 14,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        justifyContent: 'center',
    },
    chipSelected: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    text: {fontSize: 14, color: colors.text, fontFamily: fonts.regular},
    textSelected: {color: colors.surface, fontFamily: fonts.medium},
});
