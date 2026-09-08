import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/theme';
import { LIFECYCLE_STAGES } from '../services/playbook';

export const StageStepper: React.FC<{ stageId: number; onChange?: (id: number) => void }> = ({ stageId, onChange }) => {
  const current = LIFECYCLE_STAGES.find((s) => s.id === stageId) ?? LIFECYCLE_STAGES[0];
  return (
    <View>
      <View style={styles.track}>
        {LIFECYCLE_STAGES.map((stage, i) => {
          const active = stage.id === stageId;
          return (
            <React.Fragment key={stage.id}>
              <Pressable
                onPress={() => onChange?.(stage.id)}
                style={[styles.node, active && styles.nodeActive]}
                hitSlop={8}
              >
                <Text style={[styles.nodeText, active && styles.nodeTextActive]}>{stage.id}</Text>
              </Pressable>
              {i < LIFECYCLE_STAGES.length - 1 && (
                <View style={[styles.connector, stage.id < stageId && styles.connectorActive]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {LIFECYCLE_STAGES.map((stage) => (
          <Text key={stage.id} style={[styles.stageLabel, stage.id === stageId && styles.stageLabelActive]} numberOfLines={2}>
            {stage.label}
          </Text>
        ))}
      </View>
      <View style={styles.questionBox}>
        <Text style={styles.questionEyebrow}>CENTRAL QUESTION</Text>
        <Text style={styles.question}>{current.question}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  node: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gaugeTrack,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  nodeText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
  },
  nodeTextActive: {
    color: colors.bg,
    fontFamily: fonts.monoBold,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.gaugeTrack,
  },
  connectorActive: {
    backgroundColor: colors.teal,
  },
  labelsRow: {
    flexDirection: 'row',
    marginBottom: spacing(3),
  },
  stageLabel: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 8.5,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  stageLabelActive: {
    color: colors.teal,
  },
  questionBox: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    padding: spacing(3),
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  questionEyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.orange,
    letterSpacing: 1,
    marginBottom: 4,
  },
  question: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
