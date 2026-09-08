import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ScreenBackground } from '../components/ScreenBackground';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../theme/theme';
import { useAppState } from '../context/AppStateContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { recentTickers, apiKey } = useAppState();
  const [ticker, setTicker] = useState('');

  const runReport = (symbol?: string) => {
    const sym = (symbol ?? ticker).trim().toUpperCase();
    if (!sym) return;
    navigation.navigate('Report', { symbol: sym });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.kicker}>THE INVESTING PLAYBOOK</Text>
                <Text style={styles.brand}>Ticker Report</Text>
              </View>
              <Pressable onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
                <Text style={styles.iconBtnText}>⚙</Text>
              </Pressable>
            </View>

            <Text style={styles.tagline}>
              Enter a ticker, run the Playbook — quality, valuation, moat & red-flags in one brief.
            </Text>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>TICKER SYMBOL</Text>
              <TextInput
                value={ticker}
                onChangeText={(t) => setTicker(t.toUpperCase())}
                placeholder="e.g. AAPL, SM, KRMN"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                style={styles.input}
                onSubmitEditing={() => runReport()}
                returnKeyType="go"
              />
              <PrimaryButton label="RUN REPORT" onPress={() => runReport()} disabled={!ticker.trim()} style={{ marginTop: spacing(4) }} />
              {!apiKey && (
                <Text style={styles.hint}>
                  No data source configured yet — tap the gear icon to add a free Financial Modeling Prep API key.
                </Text>
              )}
            </View>

            {recentTickers.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.sectionLabel}>RECENT REPORTS</Text>
                <View style={styles.chipsRow}>
                  {recentTickers.map((t) => (
                    <Pressable key={t} onPress={() => runReport(t)} style={styles.chip}>
                      <Text style={styles.chipText}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <Pressable onPress={() => navigation.navigate('Playbook')} style={styles.playbookLink}>
              <Text style={styles.playbookLinkText}>View the Playbook checklist →</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing(5),
    paddingTop: spacing(4),
    paddingBottom: spacing(10),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing(6),
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.orange,
    marginBottom: 6,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.textPrimary,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  tagline: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: spacing(6),
  },
  inputCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing(5),
  },
  inputLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: spacing(2),
  },
  input: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingBottom: spacing(2),
    letterSpacing: 1,
  },
  hint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.watch,
    marginTop: spacing(3),
    lineHeight: 17,
  },
  recentSection: {
    marginTop: spacing(6),
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: spacing(2),
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.teal,
  },
  playbookLink: {
    marginTop: spacing(8),
    alignSelf: 'center',
  },
  playbookLinkText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
