import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// The API key is a credential, so it lives in the Android Keystore (via SecureStore), not in AsyncStorage's
// plain SQLite file. SecureStore key names may only contain letters, digits, '.', '-' and '_'.
const SECURE_API_KEY = 'ticker-report.finnhubKey';
// Where earlier versions kept the key in plain text. 'ticker-report/apiKey' held an Alpha Vantage key that
// Finnhub would reject, so it is only ever deleted.
const LEGACY_API_KEYS = { finnhub: 'ticker-report/finnhubKey', alphaVantage: 'ticker-report/apiKey' };

async function loadApiKey(): Promise<string> {
  try {
    const secure = await SecureStore.getItemAsync(SECURE_API_KEY);
    if (secure) return secure;
  } catch {
    // fall through to the one-time migration below
  }
  // One-time migration: move a key saved by an older version out of plain storage, then wipe it.
  let migrated = '';
  try {
    migrated = (await AsyncStorage.getItem(LEGACY_API_KEYS.finnhub)) ?? '';
    if (migrated) await SecureStore.setItemAsync(SECURE_API_KEY, migrated);
  } catch {
    return migrated; // couldn't write to secure storage: keep the plain copy rather than lose the key
  }
  await AsyncStorage.multiRemove([LEGACY_API_KEYS.finnhub, LEGACY_API_KEYS.alphaVantage]).catch(() => {});
  return migrated;
}

const KEYS = {
  recent: 'ticker-report/recentTickers',
  aaaYield: 'ticker-report/aaaYield',
};

interface AppState {
  apiKey: string;
  setApiKey: (key: string) => Promise<void>;
  recentTickers: string[];
  pushRecentTicker: (symbol: string) => Promise<void>;
  clearRecentTickers: () => Promise<void>;
  aaaYieldPct: number;
  setAaaYieldPct: (n: number) => Promise<void>;
  loaded: boolean;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState('');
  const [recentTickers, setRecentTickers] = useState<string[]>([]);
  const [aaaYieldPct, setAaaYieldState] = useState(4.5);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [k, r, y] = await Promise.all([
          loadApiKey(),
          AsyncStorage.getItem(KEYS.recent),
          AsyncStorage.getItem(KEYS.aaaYield),
        ]);
        if (k) setApiKeyState(k);
        if (r) setRecentTickers(JSON.parse(r));
        if (y) setAaaYieldState(parseFloat(y));
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setApiKey = useCallback(async (key: string) => {
    setApiKeyState(key);
    if (key) await SecureStore.setItemAsync(SECURE_API_KEY, key);
    else await SecureStore.deleteItemAsync(SECURE_API_KEY);
  }, []);

  const pushRecentTicker = useCallback(async (symbol: string) => {
    setRecentTickers((prev) => {
      const upper = symbol.toUpperCase();
      const next = [upper, ...prev.filter((t) => t !== upper)].slice(0, 12);
      AsyncStorage.setItem(KEYS.recent, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecentTickers = useCallback(async () => {
    setRecentTickers([]);
    await AsyncStorage.removeItem(KEYS.recent);
  }, []);

  const setAaaYieldPct = useCallback(async (n: number) => {
    setAaaYieldState(n);
    await AsyncStorage.setItem(KEYS.aaaYield, String(n));
  }, []);

  const value = useMemo(
    () => ({
      apiKey,
      setApiKey,
      recentTickers,
      pushRecentTicker,
      clearRecentTickers,
      aaaYieldPct,
      setAaaYieldPct,
      loaded,
    }),
    [apiKey, setApiKey, recentTickers, pushRecentTicker, clearRecentTickers, aaaYieldPct, setAaaYieldPct, loaded]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
