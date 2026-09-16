import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1800; // Well under the 2048-byte SecureStore limit

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    try {
      // 1. Check if chunked
      const countStr = await SecureStore.getItemAsync(`${key}_count`);
      if (countStr) {
        const count = parseInt(countStr, 10);
        if (!isNaN(count) && count > 0) {
          const chunks: string[] = [];
          for (let i = 0; i < count; i++) {
            const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
            if (chunk !== null) {
              chunks.push(chunk);
            }
          }
          if (chunks.length === count) {
            return chunks.join('');
          }
        }
      }

      // 2. Fallback to single SecureStore key
      const single = await SecureStore.getItemAsync(key);
      if (single) return single;

      // 3. Fallback to AsyncStorage
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn('[SecureStoreAdapter] getItem fallback to AsyncStorage:', e);
      return AsyncStorage.getItem(key);
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(key, value);
    }
    try {
      if (value.length <= CHUNK_SIZE) {
        // Clean up any old chunks if previously chunked
        const countStr = await SecureStore.getItemAsync(`${key}_count`).catch(() => null);
        if (countStr) {
          const count = parseInt(countStr, 10);
          for (let i = 0; i < count; i++) {
            await SecureStore.deleteItemAsync(`${key}_${i}`).catch(() => {});
          }
          await SecureStore.deleteItemAsync(`${key}_count`).catch(() => {});
        }
        await SecureStore.setItemAsync(key, value);
        return;
      }

      // Large value (>1800 bytes): split into chunks so it never exceeds 2048 bytes
      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += CHUNK_SIZE) {
        chunks.push(value.slice(i, i + CHUNK_SIZE));
      }

      await SecureStore.setItemAsync(`${key}_count`, String(chunks.length));
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${key}_${i}`, chunks[i]);
      }

      // Clean up unchunked key if it existed
      await SecureStore.deleteItemAsync(key).catch(() => {});
    } catch (e) {
      console.warn('[SecureStoreAdapter] setItem fallback to AsyncStorage:', e);
      await AsyncStorage.setItem(key, value);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(key);
    }
    try {
      const countStr = await SecureStore.getItemAsync(`${key}_count`).catch(() => null);
      if (countStr) {
        const count = parseInt(countStr, 10);
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${key}_${i}`).catch(() => {});
        }
        await SecureStore.deleteItemAsync(`${key}_count`).catch(() => {});
      }
      await SecureStore.deleteItemAsync(key).catch(() => {});
      await AsyncStorage.removeItem(key).catch(() => {});
    } catch (e) {
      console.warn('[SecureStoreAdapter] removeItem error:', e);
      await AsyncStorage.removeItem(key).catch(() => {});
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://vaubwtgxvgvyjhvtvokq.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_9Ezqm-KYQrGrg1XcSiJizw_gkpTKkKy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

