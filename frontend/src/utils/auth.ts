export const UNAUTHORIZED_EVENT = 'auth:unauthorized';
export const SESSION_EXPIRED_MESSAGE = 'Сесія закінчилась, увійдіть знову';

const getTokenExp = (token: string): number | null => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

export type AuthStatus = 'ok' | 'missing' | 'expired';

export const getAuthStatus = (): AuthStatus => {
    const token = localStorage.getItem("token");
    if (!token) return 'missing';

    const exp = getTokenExp(token);
    if (exp && exp > Date.now()) return 'ok';

    localStorage.removeItem("token");
    return 'expired';
}

export const isAuthenticated = (): boolean => getAuthStatus() === 'ok';

// Мілісекунди до закінчення токена, або null якщо токена немає
export const getTokenTimeLeft = (): number | null => {
    const token = localStorage.getItem("token");
    const exp = token ? getTokenExp(token) : null;
    return exp ? exp - Date.now() : null;
}

export const notifyUnauthorized = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}
