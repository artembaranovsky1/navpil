import {DefaultTheme, ThemeProvider, Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {QueryCache, QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {notifyUnauthorized} from '@/api/auth-events'
import {useEffect} from 'react';
import {
    useFonts, Geologica_300Light, Geologica_400Regular,
    Geologica_500Medium, Geologica_600SemiBold, Geologica_700Bold
} from '@expo-google-fonts/geologica';

import {AuthProvider, useAuth} from '@/context/auth';
import {ApiError} from "@/api/ApiError";
import {MutationCache} from "@tanstack/query-core";
import {colors} from "@/color";


SplashScreen.preventAutoHideAsync();

// дизайн лише світлий, як на фронті
const theme = {
    ...DefaultTheme,
    colors: {...DefaultTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.divider, primary: colors.accent},
};

const isUnauthorized = (err: unknown) => err instanceof ApiError && err.status === 401;

const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (err) => {
            if (isUnauthorized(err)) notifyUnauthorized();
        }
    }),
    mutationCache: new MutationCache({
        onError: (err) => {
            if (isUnauthorized(err)) notifyUnauthorized();
        }
    }),
    defaultOptions: {
        queries: {
            retry: (count, err) => !isUnauthorized(err) && count < 2,
        }
    }
});


function RootNavigator() {
    const {token, isLoading} = useAuth();

    const [fontsLoaded] = useFonts({
        Geologica_300Light,
        Geologica_400Regular,
        Geologica_500Medium,
        Geologica_600SemiBold,
        Geologica_700Bold,
    });

    const isReady = !isLoading && fontsLoaded;

    useEffect(() => {
        if (isReady) SplashScreen.hideAsync();
    }, [isReady]);

    if (!isReady) return null;

    return (
        <Stack screenOptions={{headerShown: false, contentStyle: {backgroundColor: colors.background}}}>
            <Stack.Screen name="index"/>

            <Stack.Protected guard={!!token}>
                <Stack.Screen name='(tabs)'/>
                <Stack.Screen name='trip'/>
            </Stack.Protected>

            <Stack.Protected guard={!token}>
                <Stack.Screen name="login"/>
                <Stack.Screen name="register"/>
            </Stack.Protected>
        </Stack>
    )
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ThemeProvider value={theme}>
                    <RootNavigator/>
                </ThemeProvider>
            </AuthProvider>
        </QueryClientProvider>
    )
}