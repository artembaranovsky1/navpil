import {useAuth} from "@/context/auth";
import {useLocalSearchParams} from "expo-router";
import {useMe} from "@/hooks/use-me";
import {SafeAreaView} from "react-native-safe-area-context";
import {Text} from "react-native";
import {useQuery} from "@tanstack/react-query";
import {getTrip, TripMember} from "@/api/trips";
import {ApiError} from "@/api/ApiError";

export default function MemberScreen() {
    const { id: tripId } = useLocalSearchParams<{ id: string }>();
    const { data: me } = useMe();

    const {data: trip, isLoading, error} = useQuery({
        queryKey: ['trip', tripId],
        queryFn: () => getTrip(tripId),
        enabled: !!tripId,
        retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 2,
    })

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