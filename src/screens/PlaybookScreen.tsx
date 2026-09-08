import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ScreenBackground } from '../components/ScreenBackground';
import { SectionCard } from '../components/SectionCard';
import { colors, fonts, spacing } from '../theme/theme';
import { GUIDING_PRINCIPLES, CHECKLIST, DISCLAIMER } from '../data/playbookContent';

type Props = NativeStackScreenProps<RootStackParamList, 'Playbook'>;

export default function PlaybookScreen({ navigation }: Props) {
  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>
            <Text style={styles.title}>The Playbook</Text>
            <View style={{ width: 42 }} />
          </View>

          <SectionCard eyebrow="§1 Core Philosophy" title="Ten Guiding Principles">
            {GUIDING_PRINCIPLES.map((p) => (
              <View key={p.title} style={{ marginBottom: spacing(3) }}>
                <Text style={styles.principleTitle}>{p.title}</Text>
                {p.points.map((pt) => (
                  <Text key={pt} style={styles.bullet}>
                    •  {pt}
                  </Text>
                ))}
              </View>
            ))}
          </SectionCard>

          <SectionCard eyebrow="§8 Quick Screen" title="One-Page Quality Checklist">
            {CHECKLIST.map((c) => (
              <View key={c.group} style={{ marginBottom: spacing(3) }}>
                <Text style={styles.groupTitle}>{c.group}</Text>
                {c.items.map((item) => (
                  <Text key={item} style={styles.checkItem}>
                    ☐  {item}
                  </Text>
                ))}
              </View>
            ))}
          </SectionCard>

          <Text style={styles.footnote}>{DISCLAIMER}</Text>
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
  principleTitle: { fontFamily: fonts.heading, fontSize: 14, color: colors.teal, marginBottom: 4 },
  bullet: { fontFamily: fonts.bodyRegular, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  groupTitle: { fontFamily: fonts.heading, fontSize: 14, color: colors.orange, marginBottom: 4 },
  checkItem: { fontFamily: fonts.bodyRegular, fontSize: 13, lineHeight: 20, color: colors.textSecondary },
  footnote: { fontFamily: fonts.bodyRegular, fontSize: 11, lineHeight: 16, color: colors.textMuted, marginTop: spacing(4) },
});
