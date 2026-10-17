import * as Device from 'expo-device';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {AnimatedIcon} from '@/components/animated-icon';
import {HintRow} from '@/components/hint-row';
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {WebBadge} from '@/components/web-badge';
import {BottomTabInset, MaxContentWidth, Spacing} from '@/constants/theme';
import {useEffect, useState} from "react";
import {getTrips, TripResponse} from "@/api/trips";

function getDevMenuHint() {

    if (Platform.OS === 'web') {
        return <ThemedText type="small">use browser devtools</ThemedText>;
    }
    if (Device.isDevice) {
        return (
            <ThemedText type="small">
                shake device or press <ThemedText type="code">m</ThemedText> in terminal
            </ThemedText>
        );
    }
    const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
    return (
        <ThemedText type="small">
            press <ThemedText type="code">{shortcut}</ThemedText>
        </ThemedText>
    );
}


export default function HomeScreen() {

    const [trips, setTrips] = useState<TripResponse[]>([]);
    let [count, setCount] = useState<number>(0);


    // useEffect(() => {
    //     const loadTrips = async () => {
    //         const data = await getTrips();
    //
    //         console.log('trips response:', JSON.stringify(data));
    //
    //         setTrips(data);
    //     }
    //
    //     loadTrips()
    // }, []);


    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ThemedView style={styles.heroSection}>
                    <AnimatedIcon/>
                    <ThemedText type="title" style={styles.title}>
                        Welcome to&nbsp;Expo
                    </ThemedText>
                </ThemedView>


                {/*<View>*/}
                {/*    {trips.map((trip) => (*/}
                {/*        <ThemedText key={trip.id}>{trip.name}</ThemedText>*/}
                {/*    ))}*/}
                {/*</View>*/}


                <Pressable
                    onPress={() => setCount(count + 1)}
                    style={{
                        backgroundColor: 'blue',
                        padding: 20,
                        borderRadius: 10,
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 24 }}>
                        {count}
                    </Text>
                </Pressable>

                <Text>{count}</Text>

                <ThemedText>trips:  {trips.length}</ThemedText>

                <ThemedView type="backgroundElement" style={styles.stepContainer}>
                    <HintRow
                        title="Try editing"
                        hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
                    />
                    <HintRow title="Dev tools" hint={getDevMenuHint()}/>
                    <HintRow
                        title="Fresh start"
                        hint={<ThemedText type="code">npm run reset-project</ThemedText>}
                    />
                </ThemedView>

                {Platform.OS === 'web' && <WebBadge/>}
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: Spacing.four,
        alignItems: 'center',
        gap: Spacing.three,
        paddingBottom: BottomTabInset + Spacing.three,
        maxWidth: MaxContentWidth,
    },
    heroSection: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingHorizontal: Spacing.four,
        gap: Spacing.four,
    },
    title: {
        textAlign: 'center',
    },
    code: {
        textTransform: 'uppercase',
    },
    stepContainer: {
        gap: Spacing.three,
        alignSelf: 'stretch',
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.four,
        borderRadius: Spacing.four,
    },
});
