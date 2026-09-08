import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ScreenBackground } from '../components/ScreenBackground';
import { SectionCard } from '../components/SectionCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, fonts, spacing } from '../theme/theme';
import { useAppState } from '../context/AppStateContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { apiKey, setApiKey, aaaYieldPct, setAaaYieldPct, clearRecentTickers } = useAppState();
  const [draftKey, setDraftKey] = useState(apiKey);
  const [draftYield, setDraftYield] = useState(String(aaaYieldPct));
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await setApiKey(draftKey.trim());
    const y = parseFloat(draftYield);
    if (!Number.isNaN(y) && y > 0) await setAaaYieldPct(y);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>
            <Text style={styles.title}>Settings</Text>
            <View style={{ width: 42 }} />
          </View>

          <SectionCard eyebrow="Data Source" title="Financial Modeling Prep">
            <Text style={styles.body}>
              Ticker Report pulls live quotes, company profiles, and TTM ratios from Financial Modeling Prep's
              free tier (250 requests/day). Create a free account to get an API key.
            </Text>
            <Pressable onPress={() => Linking.openURL('https://site.financialmodelingprep.com/developer/docs/')}>
              <Text style={styles.link}>site.financialmodelingprep.com/developer/docs →</Text>
            </Pressable>
            <Text style={styles.inputLabel}>API KEY</Text>
            <TextInput
              value={draftKey}
              onChangeText={setDraftKey}
              placeholder="Paste your FMP API key"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              style={styles.input}
            />
          </SectionCard>

          <SectionCard eyebrow="Graham Formula Input" title="AAA Corporate Bond Yield (Y)">
            <Text style={styles.body}>
              Used as the denominator in the intrinsic-value formula V = EPS × (8.5 + 2g) × 4.4 ÷ Y. Update this
              periodically from a source like the Moody's Seasoned Aaa Corporate Bond Yield (FRED: AAA).
            </Text>
            <Text style={styles.inputLabel}>CURRENT YIELD (%)</Text>
            <TextInput
              value={draftYield}
              onChangeText={setDraftYield}
              keyboardType="decimal-pad"
              placeholder="4.5"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </SectionCard>

          <PrimaryButton label={saved ? 'SAVED ✓' : 'SAVE SETTINGS'} onPress={save} />

          <SectionCard eyebrow="Data" title="Local History" >
            <Text style={styles.body}>Clear the recent-ticker shortcuts shown on the home screen.</Text>
            <PrimaryButton label="CLEAR RECENT TICKERS" onPress={clearRecentTickers} variant="ghost" />
          </SectionCard>

          <Text style={styles.footnote}>
            Ticker Report is informational and educational only — not investment, financial, tax, or legal advice.
            Data is drawn from third-party sources and may be delayed, incomplete, or wrong. Always verify against
            primary filings and consult a licensed professional before making decisions.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing(5), paddingTop: spacing(4), paddingBottom: spacing(10) },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(5) },
  backBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { fontSize: 22, color: colors.textSecondary, marginTop: -2 },
  title: { fontFamily: fonts.heading, fontSize: 18, color: colors.textPrimary },
  body: { fontFamily: fonts.bodyRegular, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  link: { fontFamily: fonts.mono, fontSize: 12, color: colors.teal, marginTop: 6 },
  inputLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, color: colors.textMuted, marginTop: spacing(2) },
  input: {
    fontFamily: fonts.body, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: spacing(3), paddingVertical: spacing(3), marginTop: 6, backgroundColor: colors.cardAlt,
  },
  footnote: { fontFamily: fonts.bodyRegular, fontSize: 11, lineHeight: 16, color: colors.textMuted, marginTop: spacing(4) },
});
