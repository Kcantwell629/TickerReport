import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, gradeColor, radius, spacing } from '../theme/theme';
import { FlagResult } from '../services/playbook';

export const FlagCard: React.FC<{ flag: FlagResult; index: number }> = ({ flag, index }) => {
  const c = gradeColor(flag.severity);
  return (
    <View style={[styles.card, { borderColor: c + '55' }]}>
      <View style={styles.headRow}>
        <Text style={styles.index}>FLAG {String(index).padStart(2, '0')}</Text>
        <View style={[styles.dot, { backgroundColor: c }]} />
      </View>
      <Text style={styles.title}>{flag.title.toUpperCase()}</Text>
      <Text style={[styles.reading, { color: c }]}>{flag.reading}</Text>
      <Text style={styles.detail}>{flag.detail}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing(3),
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  index: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 6,
    letterSpacing: 0.4,
  },
  reading: {
    fontFamily: fonts.monoBold,
    fontSize: 15,
    marginTop: 4,
  },
  detail: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSecondary,
    marginTop: 6,
  },
});
