import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {tokenStorage} from '@/utils/token-storage';
import {useQueryClient} from "@tanstack/react-query";
import {setUnauthorizedHandler} from "@/api/auth-events";

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
        tokenStorage.get('token')
            .then(data => setToken(data))
            .finally(() => setIsLoading(false));
    }, [])

    const signIn = async (newToken: string) => {
        await tokenStorage.set('token', newToken);
        setToken(newToken);
    }

    const signOut = async () => {
        await tokenStorage.remove('token');
        queryClient.clear();
        setToken(null);
    }

    useEffect(() => {
        setUnauthorizedHandler(signOut)
    }, []);

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