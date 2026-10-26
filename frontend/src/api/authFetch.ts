import {notifyUnauthorized} from "../utils/auth.ts";

// fetch для запитів з токеном: при 401 розлогінює юзера
export const authFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await fetch(input, init);

    if (response.status === 401) {
        notifyUnauthorized();
    }

    return response;
}
