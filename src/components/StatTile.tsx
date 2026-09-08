import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/theme';

export const StatTile: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <View style={styles.tile}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, accent && { color: colors.teal }]} numberOfLines={1} adjustsFontSizeToFit>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(3),
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginBottom: 4,
  },
  value: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
