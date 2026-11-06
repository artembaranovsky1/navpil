import {forwardRef, ReactNode, useState} from 'react';
import {StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View} from 'react-native';
import {colors, fonts} from '@/color';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
    label?: ReactNode;
    error?: string;
    hint?: string;
    inputStyle?: StyleProp<TextStyle>;
}

// поле як .input на фронті: 52 px, радіус 14, при фокусі — чорна рамка
export const TextField = forwardRef<TextInput, TextFieldProps>(
    ({label, error, hint, inputStyle, editable = true, multiline, onFocus, onBlur, ...rest}, ref) => {
        const [isFocused, setIsFocused] = useState(false);

        return (
            <View style={styles.field}>
                {label ? <Text style={styles.label}>{label}</Text> : null}
                <TextInput
                    ref={ref}
                    style={[
                        styles.input,
                        multiline && styles.multiline,
                        isFocused && styles.focused,
                        !!error && styles.invalid,
                        !editable && styles.disabled,
                        inputStyle,
                    ]}
                    placeholderTextColor={colors.faint}
                    editable={editable}
                    multiline={multiline}
                    onFocus={(event) => {
                        setIsFocused(true);
                        onFocus?.(event);
                    }}
                    onBlur={(event) => {
                        setIsFocused(false);
                        onBlur?.(event);
                    }}
                    {...rest}
                />
                {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
            </View>
        );
    }
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
    field: {gap: 6},
    label: {fontSize: 13, color: colors.mutedStrong, fontFamily: fonts.regular},
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: fonts.regular,
        color: colors.text,
        backgroundColor: colors.surface,
    },
    multiline: {
        height: undefined,
        minHeight: 96,
        paddingTop: 14,
        paddingBottom: 14,
        textAlignVertical: 'top',
    },
    focused: {borderColor: colors.text},
    invalid: {borderColor: colors.error},
    disabled: {backgroundColor: '#F4F4F1', borderColor: colors.divider, color: colors.faint},
    error: {fontSize: 13, color: colors.error, fontFamily: fonts.regular},
    hint: {fontSize: 12, color: colors.muted, fontFamily: fonts.regular},
});
