import {StyleSheet, Text} from 'react-native';
import {colors, fonts} from '@/color';

// nav/pil — як у мобільній шапці фронту
export function Wordmark({size = 18, color = colors.text}: { size?: number; color?: string }) {
    return (
        <Text style={[styles.wordmark, {fontSize: size, color}]}>
            nav<Text style={styles.slash}>/</Text>pil
        </Text>
    );
}

const styles = StyleSheet.create({
    wordmark: {fontFamily: fonts.semibold, letterSpacing: -0.4},
    slash: {color: colors.accent},
});
