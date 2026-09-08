import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/theme';

interface Props {
  price: number;
  marginOfSafetyPrice: number;
  intrinsicValue: number;
}

/**
 * Horizontal scale from 0 to ~1.3x intrinsic value, with markers for
 * current price (P), the 2/3-of-value margin-of-safety line (S), and
 * full intrinsic value (V) — mirrors the Playbook's "P < S = V × 0.65" rule.
 */
export const ValueBar: React.FC<Props> = ({ price, marginOfSafetyPrice, intrinsicValue }) => {
  const max = Math.max(intrinsicValue * 1.3, price * 1.1, 1);
  const pct = (v: number) => Math.max(0, Math.min(100, (v / max) * 100));

  return (
    <View>
      <View style={styles.track}>
        <View style={[styles.safeZone, { width: `${pct(marginOfSafetyPrice)}%` }]} />
        <View style={[styles.marker, { left: `${pct(marginOfSafetyPrice)}%`, backgroundColor: colors.teal }]} />
        <View style={[styles.marker, { left: `${pct(intrinsicValue)}%`, backgroundColor: colors.textSecondary }]} />
        <View style={[styles.priceMarker, { left: `${pct(price)}%` }]} />
      </View>
      <View style={styles.legendRow}>
        <LegendItem color={colors.teal} label={`S ${fmt(marginOfSafetyPrice)}`} sub="margin of safety" />
        <LegendItem color={colors.textSecondary} label={`V ${fmt(intrinsicValue)}`} sub="intrinsic value" />
        <LegendItem color={colors.orange} label={`P ${fmt(price)}`} sub="current price" />
      </View>
    </View>
  );
};

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

const LegendItem: React.FC<{ color: string; label: string; sub: string }> = ({ color, label, sub }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <View>
      <Text style={[styles.legendLabel, { color }]}>{label}</Text>
      <Text style={styles.legendSub}>{sub}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.gaugeTrack,
    position: 'relative',
    marginTop: spacing(2),
    marginBottom: spacing(4),
  },
  safeZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.tealGlow,
    borderRadius: radius.pill,
  },
  marker: {
    position: 'absolute',
    top: -3,
    width: 2,
    height: 16,
    marginLeft: -1,
  },
  priceMarker: {
    position: 'absolute',
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.orange,
    marginLeft: -6,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontFamily: fonts.monoBold,
    fontSize: 12,
  },
  legendSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 9,
    color: colors.textMuted,
  },
});
