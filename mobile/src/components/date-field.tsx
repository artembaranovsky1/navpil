import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {fromApiDate, toApiDate} from "@/api/helper";
import {colors, fonts} from '@/color';
import {Icon} from '@/components/ui/icon';



type Props = {
    label: string;
    value: string;                        // '' або '2026-05-12'
    onChange: (value: string) => void;
    minimumDate?: string;                 // '2026-05-12'
    disabled?: boolean;
};

// 12 травня 2026
const formatDate = (date: Date) =>
    date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

export function DateField({ label, value, onChange, minimumDate, disabled = false }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    // рядок → Date, щоб показати в календарі
    const date = value ? fromApiDate(value) : null;
    const minDate = minimumDate ? fromApiDate(minimumDate) : undefined;

    const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
        // На Android календар — діалог, після вибору чи скасування його треба закрити
        if (Platform.OS === 'android') {
            setIsOpen(false);
        }

        if (event.type === 'set' && selected) {
            onChange(toApiDate(selected));      // Date → рядок назовні
        }
    };

    const handleClear = () => {
        onChange('');
        setIsOpen(false);
    };

    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>

            <Pressable
                onPress={() => setIsOpen(!isOpen)}
                disabled={disabled}
                style={[
                    styles.input,
                    isOpen && styles.inputFocused,
                    disabled && styles.inputDisabled,
                ]}
            >
                <Text style={date ? styles.value : styles.placeholder}>
                    {date ? formatDate(date) : 'Оберіть дату'}
                </Text>

                {value && !disabled ? (
                    <Pressable onPress={handleClear} hitSlop={10}>
                        <Icon name="close" size={16} color={colors.muted}/>
                    </Pressable>
                ) : null}
            </Pressable>

            {isOpen ? (
                <DateTimePicker
                    value={date ?? minDate ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={handleChange}
                    minimumDate={minDate}
                    locale="uk-UA"
                    accentColor={colors.accent}
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    field: {
        gap: 6,
    },
    label: {
        fontSize: 13,
        color: colors.mutedStrong,
        fontFamily: fonts.regular,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 16,
        backgroundColor: colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputFocused: {
        borderColor: colors.text,
    },
    inputDisabled: {
        backgroundColor: '#F4F4F1',
        borderColor: colors.divider,
    },
    value: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.regular,
    },
    placeholder: {
        fontSize: 16,
        color: colors.faint,
        fontFamily: fonts.regular,
    },
});
