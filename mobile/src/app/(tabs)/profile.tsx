import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "@/context/auth";
import {useMe} from "@/hooks/queries";
import {colors, fonts} from "@/color";
import {Avatar} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Wordmark} from "@/components/ui/wordmark";

export default function ProfileScreen() {
    const {signOut} = useAuth();
    const {data: me} = useMe();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Wordmark/>
            <Text style={styles.title}>Профіль</Text>

            {me && (
                <View style={styles.card}>
                    <Avatar id={me.id} name={me.name} size={52} background={colors.text}/>
                    <View style={styles.info}>
                        <Text style={styles.name}>{me.name}</Text>
                        <Text style={styles.email} numberOfLines={1}>{me.email}</Text>
                    </View>
                </View>
            )}

            <Button variant="danger" size="lg" icon="logout" onPress={signOut}>
                Вийти
            </Button>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {flex: 1, paddingHorizontal: 24, paddingTop: 16, gap: 24, backgroundColor: colors.background},
    title: {fontSize: 30, letterSpacing: -0.8, color: colors.text, fontFamily: fonts.regular},
    card: {
        padding: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    info: {flex: 1, minWidth: 0},
    name: {fontSize: 17, color: colors.text, fontFamily: fonts.medium},
    email: {marginTop: 2, fontSize: 13, color: colors.muted, fontFamily: fonts.regular},
});
