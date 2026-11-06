import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, G, Text as SvgText} from 'react-native-svg';
import {colors, fonts} from '@/color';
import {CATEGORY_LABELS, ExpenseCategory, ExpenseResponse} from '@/api/expense';
import {formatMoney} from '@/context/format';
import {CATEGORY_COLORS, CATEGORY_ORDER} from '@/utils/colors';

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// невеликий проміжок між сегментами кільця
const GAP = 2;

// мобільна картка категорій: кільце з кількістю категорій і суми в легенді — як compact на фронті
export function CategoryChart({expenses}: { expenses: ExpenseResponse[] }) {
    const totals = new Map<ExpenseCategory, number>();
    expenses.forEach((expense) => {
        totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
    });

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // у кільці категорії йдуть у фіксованому порядку — так сусідні кольори завжди добре розрізняються
    const segments = CATEGORY_ORDER
        .filter((category) => (totals.get(category) ?? 0) > 0)
        .map((category) => ({category, amount: totals.get(category)!}));

    const categories = segments.map(({category, amount}, index) => ({
        category,
        amount,
        color: CATEGORY_COLORS[category],
        length: (amount / total) * CIRCUMFERENCE,
        // сегмент починається там, де закінчились усі попередні
        offset: segments.slice(0, index).reduce((sum, prev) => sum + (prev.amount / total) * CIRCUMFERENCE, 0),
    }));

    // а в легенді — від найбільшої суми
    const legend = [...categories].sort((a, b) => b.amount - a.amount);
    const hasGap = categories.length > 1;

    if (categories.length === 0) return null;

    return (
        <View style={styles.card}>
            <Svg width={96} height={96} viewBox="0 0 96 96">
                <G rotation={-90} origin="48, 48">
                    {categories.map((c) => {
                        const visible = hasGap ? Math.max(c.length - GAP, 0.5) : c.length;

                        return (
                            <Circle
                                key={c.category}
                                cx={48}
                                cy={48}
                                r={RADIUS}
                                fill="none"
                                stroke={c.color}
                                strokeWidth={12}
                                strokeDasharray={`${visible} ${CIRCUMFERENCE - visible}`}
                                strokeDashoffset={-c.offset}
                            />
                        );
                    })}
                </G>
                <SvgText x={48} y={52} textAnchor="middle" fontSize={13} fontFamily={fonts.medium} fill={colors.text}>
                    {`${categories.length} кат.`}
                </SvgText>
            </Svg>

            <View style={styles.legend}>
                {legend.map((c) => (
                    <View key={c.category} style={styles.item}>
                        <View style={[styles.dot, {backgroundColor: c.color}]}/>
                        <Text style={styles.name}>{CATEGORY_LABELS[c.category]}</Text>
                        <Text style={styles.amount}>{formatMoney(c.amount)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 18,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    legend: {flex: 1, gap: 10},
    item: {flexDirection: 'row', alignItems: 'center', gap: 8},
    dot: {width: 8, height: 8, borderRadius: 4},
    name: {flex: 1, fontSize: 14, color: colors.text, fontFamily: fonts.regular},
    amount: {fontSize: 14, color: colors.text, fontFamily: fonts.medium},
});
