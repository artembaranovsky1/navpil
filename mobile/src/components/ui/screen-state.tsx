import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {colors, fonts} from '@/color';

// завантаження або помилка на весь екран
export function ScreenState({error}: { error?: string }) {
    return (
        <View style={styles.center}>
            {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator color={colors.text}/>}
        </View>
    );
}

const styles = StyleSheet.create({
    center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background},
    error: {fontSize: 14, color: colors.muted, fontFamily: fonts.regular, textAlign: 'center'},
});
