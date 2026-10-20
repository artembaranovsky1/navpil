import {Pressable, StyleSheet, Text} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "@/context/auth";

export default function ProfileScreen() {
    const {signOut} = useAuth();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Text style={styles.title}>Профіль</Text>

            <Pressable
                style={({pressed}) => [styles.button, pressed && {opacity: 0.85}]}
                onPress={signOut}
            >
                <Text style={styles.buttonText}>Вийти</Text>
            </Pressable>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20, gap: 24},
    title: {fontSize: 30, fontWeight: '700', color: '#111111'},
    button: {
        height: 56,
        borderRadius: 28,
        backgroundColor: '#111111',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '500',
    },
});
