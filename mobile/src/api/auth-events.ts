let onUnauthorized: (() => void) | null = null;

// AuthProvider реєструє тут свій signOut
export const setUnauthorizedHandler = (fn: () => void) => {
    onUnauthorized = fn;
};

// QueryClient викликає це, коли сервер відповів 401
export const notifyUnauthorized = () => {
    onUnauthorized?.();
};