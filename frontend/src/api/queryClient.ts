import {QueryClient} from "@tanstack/react-query";
import {ApiError} from "./ApiError.ts";

// помилки клієнта (4xx) повторювати немає сенсу — відповідь буде та сама
const isClientError = (err: unknown) => err instanceof ApiError && err.status >= 400 && err.status < 500;

// 401 окремо не обробляємо: authFetch сам розлогінює юзера, а ProtectedRoutes чистить кеш
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: (count, err) => !isClientError(err) && count < 2,
        },
        mutations: {
            retry: false,
        },
    },
});
