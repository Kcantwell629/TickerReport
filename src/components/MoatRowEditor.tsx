import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/theme';
import { MOAT_DIRECTIONS, MOAT_SOURCES, MOAT_WIDTHS, MoatRow } from '../services/playbook';
import { SegmentedPicker } from './SegmentedPicker';

const widthTone: Record<string, string> = {
  None: colors.fail,
  Narrow: colors.watch,
  Wide: colors.pass,
};

const directionTone: Record<string, string> = {
  Shrinking: colors.fail,
  Stable: colors.watch,
  Widening: colors.pass,
};

export const MoatRowEditor: React.FC<{
  row: MoatRow;
  onChange: (row: MoatRow) => void;
}> = ({ row, onChange }) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.fieldLabel}>SOURCE</Text>
      <SegmentedPicker options={MOAT_SOURCES} value={row.source} onChange={(source) => onChange({ ...row, source })} />

      <View style={styles.twoCol}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>WIDTH</Text>
          <SegmentedPicker options={MOAT_WIDTHS} value={row.width} onChange={(width) => onChange({ ...row, width })} />
        </View>
      </View>
      <View style={styles.twoCol}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>DIRECTION</Text>
          <SegmentedPicker options={MOAT_DIRECTIONS} value={row.direction} onChange={(direction) => onChange({ ...row, direction })} />
        </View>
      </View>

      <View style={styles.badgeRow}>
        <View style={[styles.pill, { borderColor: widthTone[row.width] }]}>
          <Text style={[styles.pillText, { color: widthTone[row.width] }]}>{row.width.toUpperCase()}</Text>
        </View>
        <View style={[styles.pill, { borderColor: directionTone[row.direction] }]}>
          <Text style={[styles.pillText, { color: directionTone[row.direction] }]}>{row.direction.toUpperCase()}</Text>
        </View>
      </View>

      <TextInput
        value={row.note}
        onChangeText={(note) => onChange({ ...row, note })}
        placeholder="Why? (optional note)"
        placeholderTextColor={colors.textMuted}
        style={styles.note}
        multiline
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing(3),
    marginBottom: spacing(3),
  },
  fieldLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 6,
    marginTop: 6,
  },
  twoCol: {
    flexDirection: 'row',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing(2),
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  note: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: spacing(2),
    minHeight: 32,
  },
});
