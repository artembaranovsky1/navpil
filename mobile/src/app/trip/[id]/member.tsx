import {useLocalSearchParams} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, StyleSheet, Text, View} from "react-native";
import { TripMember} from "@/api/trips";
import {useTrip} from "@/hooks/queries";
import {colors} from "@/color";

export default function MemberScreen() {
    const { id: tripId } = useLocalSearchParams<{ id: string }>();

    const {data: trip, isLoading, error} = useTrip(tripId);

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.muted}>Не вдалося завантажити подорожі</Text>
            </View>
        );
    }

    return (
        <SafeAreaView>

            <Text>Invite code: {trip?.inviteCode}</Text>
            <Text>Member</Text>
            {trip?.members.map((member: TripMember) => (
                <Text key={member.id}>{member.name} {member.role}</Text>
            ))}
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 20,
    },
    center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    muted: {fontSize: 14, color: '#6B6B66'},
})