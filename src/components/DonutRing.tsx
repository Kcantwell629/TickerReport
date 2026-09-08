import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, fonts } from '../theme/theme';

interface Props {
  size?: number;
  strokeWidth?: number;
  fraction: number; // 0..1
  label: string;
  sublabel?: string;
  colorFrom?: string;
  colorTo?: string;
}

export const DonutRing: React.FC<Props> = ({
  size = 116,
  strokeWidth = 12,
  fraction,
  label,
  sublabel,
  colorFrom = colors.teal,
  colorTo = colors.orange,
}) => {
  const radiusPx = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusPx;
  const clamped = Math.max(0, Math.min(1, fraction));
  const dashOffset = circumference * (1 - clamped);
  const gradId = `donutGrad-${label.replace(/\s+/g, '')}`;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colorFrom} />
            <Stop offset="100%" stopColor={colorTo} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={radiusPx} stroke={colors.gaugeTrack} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusPx}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          fill="none"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.label}>{label}</Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  sublabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
