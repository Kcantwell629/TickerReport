import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, gradeColor, Grade, radius } from '../theme/theme';

export const Badge: React.FC<{ label: string; grade?: Grade; tone?: 'teal' | 'orange' | 'neutral'; style?: ViewStyle }> = ({
  label,
  grade,
  tone = 'neutral',
  style,
}) => {
  let bg = colors.cardAlt;
  let fg = colors.textSecondary;
  let borderColor = colors.border;

  if (grade) {
    const c = gradeColor(grade);
    bg = c + '22';
    fg = c;
    borderColor = c + '55';
  } else if (tone === 'teal') {
    bg = colors.tealGlow;
    fg = colors.teal;
    borderColor = colors.teal + '55';
  } else if (tone === 'orange') {
    bg = colors.orangeGlow;
    fg = colors.orange;
    borderColor = colors.orange + '55';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor }, style]}>
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
  },
});
