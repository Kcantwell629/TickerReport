import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/theme';

export const ScreenBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={styles.wrap}>
      <LinearGradient colors={gradients.screenBg} style={StyleSheet.absoluteFill} />
      <View style={styles.glowTeal} />
      <View style={styles.glowOrange} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  glowTeal: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.tealGlow,
  },
  glowOrange: {
    position: 'absolute',
    bottom: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.orangeGlow,
  },
});
