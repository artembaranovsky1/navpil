import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {fromApiDate, toApiDate} from "@/api/helper";



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
                        <Text style={styles.clear}>✕</Text>
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
                    accentColor="#0F8A5F"
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
        fontSize: 14,
        color: '#6B6B66',
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E2E2DD',
        borderRadius: 14,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputFocused: {
        borderColor: '#111111',
    },
    inputDisabled: {
        opacity: 0.5,
    },
    value: {
        fontSize: 16,
        color: '#111111',
    },
    placeholder: {
        fontSize: 16,
        color: '#6B6B66',
    },
    clear: {
        fontSize: 16,
        color: '#6B6B66',
    },
});