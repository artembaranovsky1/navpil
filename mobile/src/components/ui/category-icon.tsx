import {StyleSheet, View} from 'react-native';
import {ExpenseCategory} from '@/api/expense';
import {CATEGORY_COLORS} from '@/utils/colors';
import {Icon} from '@/components/ui/icon';

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
    food: 'M4 3v8a3 3 0 0 0 6 0V3M7 3v18M17 3c-2 0-3 3-3 7h3v11',
    transport: 'M5 17V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14H5zM15 9h2l2 2v6a1.5 1.5 0 0 1-3 0v-3h-1M8 9h4',
    housing: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
    shopping: 'M3 5h2l2 11h11l2-8H6M9 20h.01M17 20h.01',
    entertainment: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z',
    other: 'M5 12h.01M12 12h.01M19 12h.01',
};

const SIZES = {
    md: {box: 32, radius: 10, icon: 16},
    list: {box: 36, radius: 12, icon: 18},
    lg: {box: 52, radius: 16, icon: 24},
};

// '#RRGGBB' змішаний з білим (target 255) чи чорним (0), weight — частка базового кольору; як color-mix на фронті
const mix = (hex: string, target: number, weight: number): string => {
    const channel = (offset: number) => {
        const value = parseInt(hex.slice(offset, offset + 2), 16);
        return Math.round(value * weight + target * (1 - weight)).toString(16).padStart(2, '0');
    };
    return `#${channel(1)}${channel(3)}${channel(5)}`;
};

type CategoryIconProps = {
    category: ExpenseCategory;
    size?: keyof typeof SIZES;
}

export function CategoryIcon({category, size = 'md'}: CategoryIconProps) {
    const base = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
    const {box, radius, icon} = SIZES[size];

    return (
        <View style={[styles.icon, {width: box, height: box, borderRadius: radius, backgroundColor: mix(base, 255, 0.16)}]}>
            <Icon path={CATEGORY_ICONS[category] ?? CATEGORY_ICONS.other} size={icon} color={mix(base, 0, 0.85)}/>
        </View>
    );
}

const styles = StyleSheet.create({
    icon: {alignItems: 'center', justifyContent: 'center'},
});
