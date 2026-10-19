import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useEffect, useState} from "react";
import {getTrips, TripResponse, TripsResponse} from "@/api/trips";
import {ThemedText} from "@/components/themed-text";
import {ApiError} from "@/api/ApiError";
import {useAuth} from "@/context/auth";
import {router, useLocalSearchParams} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import {useQuery} from "@tanstack/react-query";
import {useMe} from "@/hooks/use-me";

export default function TripsScreen() {
    const {signOut} = useAuth();

    // const { data: me } = useMe();


    const { data: trips, isLoading, error } = useQuery({
        queryKey: ['trips'],
        queryFn: getTrips,
        retry: (count, err) => !(err instanceof ApiError && err.status === 401) && count < 2,
    });

    useEffect(() => {
        if (error instanceof ApiError && error.status === 401) {
            signOut();
        }
    }, [error]);

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
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.title}>Подорожі</Text>
                <TripSection title="Зараз" items={trips?.active ?? []}/>
                <TripSection title="Майбутні" items={trips?.upcoming ?? []}/>
                <TripSection title="Минулі" items={trips?.past ?? []}/>

                <View style={styles.buttonGroup}>
                    <Pressable
                        style={({pressed}) => [styles.button, pressed && {opacity: 0.85}]}
                        onPress={() => router.push(`/trip/join`)}
                    >
                        <Text style={styles.buttonText}>Приєднатися</Text>
                    </Pressable>

                    <Pressable
                        style={({pressed}) => [styles.primaryButton, pressed && {opacity: 0.85}]}
                        onPress={() => router.push(`/trip/newTrip`)}
                    >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>Нова подорож</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

function TripSection({title, items}: { title: string; items: TripResponse[] }) {
    if (items.length === 0) return null;   // порожній блок не показуємо

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>

            {items.map((trip) => (
                <Pressable
                    key={trip.id}
                    onPress={() => router.push(`/trip/${trip.id}`)}
                    style={({pressed}) => [styles.card, pressed && {opacity: 0.85}]}
                >
                    <Text style={styles.cardTitle}>{trip.name}</Text>
                    <Text style={styles.muted}>{trip.members.length} учасн.</Text>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    content: {padding: 20, gap: 24},
    center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    title: {fontSize: 30, fontWeight: '700', color: '#111111'},
    section: {gap: 10},
    sectionTitle: {fontSize: 14, color: '#6B6B66', textTransform: 'uppercase'},
    card: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E2DD',
        borderRadius: 18,
        padding: 16,
        gap: 4,
    },
    cardTitle: {fontSize: 17, fontWeight: '600', color: '#111111'},
    muted: {fontSize: 14, color: '#6B6B66'},
    buttonGroup: {
        marginTop: 100,
        flexDirection: 'row',
        gap: 16,
    },
    button: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    buttonText: {
        color: '#111111',
        fontSize: 15,
        fontWeight: '500',
    },
    primaryButton: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#111111',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '500',
    }

});