import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  apiKey: 'ticker-report/apiKey',
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
          AsyncStorage.getItem(KEYS.apiKey),
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
    await AsyncStorage.setItem(KEYS.apiKey, key);
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
