import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, gradeColor, Grade, radius, spacing } from '../theme/theme';

interface Props {
  index: number;
  label: string;
  formula: string;
  target: string;
  valueLabel: string;
  fraction: number; // 0..1 fill
  thresholdFraction?: number; // 0..1 tick position
  grade: Grade;
}

export const MetricGauge: React.FC<Props> = ({ index, label, formula, target, valueLabel, fraction, thresholdFraction, grade }) => {
  const fillColor = gradeColor(grade);
  return (
    <View style={styles.row}>
      <View style={styles.topLine}>
        <Text style={styles.index}>{String(index).padStart(2, '0')}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.formula}>{formula}</Text>
        </View>
        <View style={styles.readingWrap}>
          <Text style={[styles.value, { color: fillColor }]}>{valueLabel}</Text>
          <Text style={[styles.grade, { color: fillColor }]}>{grade}</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fraction * 100}%`, backgroundColor: fillColor }]} />
        {thresholdFraction !== undefined && thresholdFraction >= 0 && thresholdFraction <= 1 && (
          <View style={[styles.tick, { left: `${thresholdFraction * 100}%` }]} />
        )}
      </View>
      <Text style={styles.target}>TARGET {target}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing(1),
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  index: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
    marginRight: spacing(2),
    width: 20,
  },
  label: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.textPrimary,
  },
  formula: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  readingWrap: {
    alignItems: 'flex-end',
  },
  value: {
    fontFamily: fonts.monoBold,
    fontSize: 15,
  },
  grade: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 1,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.gaugeTrack,
    overflow: 'visible',
    position: 'relative',
  },
  fill: {
    height: 8,
    borderRadius: radius.pill,
  },
  tick: {
    position: 'absolute',
    top: -3,
    width: 2,
    height: 14,
    backgroundColor: colors.textSecondary,
    marginLeft: -1,
  },
  target: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 5,
    letterSpacing: 0.5,
  },
});
