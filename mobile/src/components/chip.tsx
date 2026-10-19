import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/color';

type Props = {
    label: string;
    selected: boolean;
    onPress: () => void;
    disabled: boolean;
}

export function Chip({label, selected, onPress, disabled}: Props) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
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
        paddingHorizontal: 16,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        justifyContent: 'center',
    },
    chipSelected: {
        backgroundColor: colors.text,
        borderColor: colors.text,
    },
    text: { fontSize: 15, color: colors.text },
    textSelected: { color: colors.surface },
});