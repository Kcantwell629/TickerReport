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

export interface LoadedAssessment {
  assessment: Assessment;
  /** True when nothing was previously saved for this ticker — safe to auto-suggest a stage/moat read. */
  isNew: boolean;
}

export async function loadAssessment(symbol: string): Promise<LoadedAssessment> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(symbol));
    if (!raw) return { assessment: defaultAssessment(), isNew: true };
    const parsed = JSON.parse(raw);
    return { assessment: { ...defaultAssessment(), ...parsed }, isNew: false };
  } catch {
    return { assessment: defaultAssessment(), isNew: true };
  }
}

export async function saveAssessment(symbol: string, assessment: Assessment): Promise<void> {
  await AsyncStorage.setItem(keyFor(symbol), JSON.stringify({ ...assessment, updatedAt: new Date().toISOString() }));
}
