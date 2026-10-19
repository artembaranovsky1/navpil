import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import * as SecureStore from 'expo-secure-store';
import {useQueryClient} from "@tanstack/react-query";

type AuthContextValue = {
    token: string | null;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const queryClient = useQueryClient();

    useEffect(() => {
        SecureStore.getItemAsync('token')
            .then(data => setToken(data))
            .finally(() => setIsLoading(false));
    }, [])

    const signIn = async (newToken: string) => {
        await SecureStore.setItemAsync('token', newToken);
        setToken(newToken);
    }

    const signOut = async () => {
        await SecureStore.deleteItemAsync('token')
        setToken(null);
        queryClient.clear();
    }

    return (
        <AuthContext.Provider value={{token, isLoading, signIn, signOut}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext);

    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}