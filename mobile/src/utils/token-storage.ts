import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store не підтримує web, тож у браузері токен лежить у localStorage
const isWeb = Platform.OS === 'web';

export const tokenStorage = {
    get: async (key: string): Promise<string | null> =>
        isWeb ? localStorage.getItem(key) : SecureStore.getItemAsync(key),
    set: async (key: string, value: string): Promise<void> =>
        isWeb ? localStorage.setItem(key, value) : SecureStore.setItemAsync(key, value),
    remove: async (key: string): Promise<void> =>
        isWeb ? localStorage.removeItem(key) : SecureStore.deleteItemAsync(key),
};
