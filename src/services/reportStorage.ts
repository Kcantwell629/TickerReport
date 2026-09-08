import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoatRow, defaultMoatRows } from './playbook';

export type Rating = 'BUY' | 'HOLD' | 'SELL';

export interface Assessment {
  stageId: number;
  moatRows: MoatRow[];
  headline: string;
  extraBull: string;
  extraBear: string;
  rating: Rating;
  updatedAt: string;
}

function keyFor(symbol: string) {
  return `ticker-report/assessment/${symbol.toUpperCase()}`;
}

export function defaultAssessment(): Assessment {
  return {
    stageId: 4,
    moatRows: defaultMoatRows(),
    headline: '',
    extraBull: '',
    extraBear: '',
    rating: 'HOLD',
    updatedAt: new Date().toISOString(),
  };
}

export async function loadAssessment(symbol: string): Promise<Assessment> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(symbol));
    if (!raw) return defaultAssessment();
    const parsed = JSON.parse(raw);
    return { ...defaultAssessment(), ...parsed };
  } catch {
    return defaultAssessment();
  }
}

export async function saveAssessment(symbol: string, assessment: Assessment): Promise<void> {
  await AsyncStorage.setItem(keyFor(symbol), JSON.stringify({ ...assessment, updatedAt: new Date().toISOString() }));
}
