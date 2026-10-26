import {Outlet, Navigate, useNavigate} from "react-router";
import {useEffect} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {getAuthStatus, getTokenTimeLeft, notifyUnauthorized, SESSION_EXPIRED_MESSAGE, UNAUTHORIZED_EVENT} from "./auth.ts";


export const ProtectedRoutes = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const redirectToLogin = () => {
            // кеш належить розлогіненому юзеру
            queryClient.clear();
            navigate('/login', {replace: true, state: {authError: SESSION_EXPIRED_MESSAGE}});
        }

        // токен видалили в іншій вкладці
        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'token' && !event.newValue) redirectToLogin();
        }

        // токен закінчився, поки сторінка відкрита
        const timeLeft = getTokenTimeLeft();
        const timer = timeLeft !== null
            ? setTimeout(notifyUnauthorized, Math.min(Math.max(timeLeft, 0), 2 ** 31 - 1))
            : undefined;

        window.addEventListener(UNAUTHORIZED_EVENT, redirectToLogin);
        window.addEventListener('storage', handleStorage);

        return () => {
            clearTimeout(timer);
            window.removeEventListener(UNAUTHORIZED_EVENT, redirectToLogin);
            window.removeEventListener('storage', handleStorage);
        }
    }, [navigate, queryClient]);

    const status = getAuthStatus();

    if (status === 'ok') return <Outlet/>;

    return <Navigate
        to='/login'
        replace
        state={status === 'expired' ? {authError: SESSION_EXPIRED_MESSAGE} : undefined}
    />
}
