import type {ReactNode} from 'react';
import {ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors, fonts} from '@/color';
import {Icon, IconName} from '@/components/ui/icon';

type ButtonVariant = 'primary' | 'secondary' | 'white' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
    children: ReactNode;
    onPress?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: IconName;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}

// як Button на фронті: pill-кнопка, менше 44 px не робимо
export function Button({
                           children,
                           onPress,
                           variant = 'primary',
                           size = 'md',
                           icon,
                           loading = false,
                           disabled = false,
                           style,
                       }: ButtonProps) {
    const isDisabled = disabled || loading;
    const textColor = disabled && !loading ? colors.disabledText : TEXT_COLORS[variant];

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityState={{disabled: isDisabled, busy: loading}}
            style={({pressed}) => [
                styles.button,
                styles[size],
                styles[variant],
                pressed && styles[`${variant}Pressed`],
                pressed && styles.pressed,
                disabled && !loading && styles.disabled,
                style,
            ]}
        >
            {/* текст лишається на місці й тримає ширину кнопки */}
            <View style={[styles.label, loading && styles.hidden]}>
                {icon && <Icon name={icon} size={size === 'lg' ? 18 : 16} color={textColor} strokeWidth={2}/>}
                <Text style={[styles.text, styles[`${size}Text`], {color: textColor}]}>{children}</Text>
            </View>
            {loading && <ActivityIndicator style={StyleSheet.absoluteFill} color={textColor}/>}
        </Pressable>
    );
}

const TEXT_COLORS: Record<ButtonVariant, string> = {
    primary: colors.surface,
    secondary: colors.text,
    white: colors.text,
    danger: colors.error,
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {transform: [{scale: 0.97}]},
    label: {flexDirection: 'row', alignItems: 'center', gap: 8},
    hidden: {opacity: 0},
    text: {fontFamily: fonts.medium},

    sm: {height: 44, paddingHorizontal: 16},
    md: {height: 48, paddingHorizontal: 22},
    lg: {height: 56, paddingHorizontal: 28, alignSelf: 'stretch'},
    smText: {fontSize: 14},
    mdText: {fontSize: 15},
    lgText: {fontSize: 16},

    primary: {backgroundColor: colors.text},
    primaryPressed: {backgroundColor: '#000000'},
    secondary: {backgroundColor: 'transparent', borderColor: colors.text},
    secondaryPressed: {backgroundColor: colors.ghostHover},
    white: {backgroundColor: colors.surface, borderColor: colors.border},
    whitePressed: {backgroundColor: colors.ghostHover},
    danger: {backgroundColor: 'transparent', borderColor: colors.border},
    dangerPressed: {backgroundColor: colors.errorTint, borderColor: colors.error},

    disabled: {backgroundColor: colors.disabledBg, borderColor: colors.disabledBg},
});
